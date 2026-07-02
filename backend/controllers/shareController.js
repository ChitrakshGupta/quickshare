import bcrypt from 'bcryptjs';
import { getStorage } from '../services/storageService.js';
import { generateCode } from '../utils/codeGenerator.js';

export async function createShare(req, res) {
  try {
    const { content, expiresIn = 600, password, isOneTime = false, language = 'text', fileName = null, fileType = null } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be a string' });
    }

    const duration = parseInt(expiresIn, 10);
    if (isNaN(duration) || duration < 60 || duration > 86400) {
      return res.status(400).json({ error: 'Expiration must be between 60 seconds (1 min) and 86400 seconds (24 hours)' });
    }

    const storage = await getStorage();
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      code = generateCode();
      const existing = await storage.get(code);
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate a unique sharing code. Please try again.' });
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const payload = {
      content,
      isOneTime: !!isOneTime,
      passwordHash,
      language,
      fileName,
      fileType,
      createdAt: Date.now()
    };

    await storage.set(code, JSON.stringify(payload), duration);

    return res.status(201).json({
      code,
      expiresIn: duration,
      hasPassword: !!password,
      isOneTime: !!isOneTime
    });
  } catch (error) {
    console.error('Error creating share:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getShare(req, res) {
  try {
    const { code } = req.params;
    const storage = await getStorage();
    const raw = await storage.get(code);

    if (!raw) {
      return res.status(404).json({ error: 'Share not found or has expired' });
    }

    const share = JSON.parse(raw);
    const ttl = await storage.getTTL(code);

    if (share.passwordHash) {
      return res.status(200).json({
        requiresPassword: true,
        expiresIn: ttl,
        fileName: share.fileName,
        fileType: share.fileType
      });
    }

    if (share.isOneTime) {
      await storage.del(code);
    }

    return res.status(200).json({
      content: share.content,
      expiresIn: ttl,
      language: share.language,
      fileName: share.fileName,
      fileType: share.fileType,
      isOneTime: share.isOneTime
    });
  } catch (error) {
    console.error('Error retrieving share:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function verifyPassword(req, res) {
  try {
    const { code } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const storage = await getStorage();
    const raw = await storage.get(code);

    if (!raw) {
      return res.status(404).json({ error: 'Share not found or has expired' });
    }

    const share = JSON.parse(raw);

    if (!share.passwordHash) {
      return res.status(400).json({ error: 'This share does not require a password' });
    }

    const isMatch = await bcrypt.compare(password, share.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const ttl = await storage.getTTL(code);

    if (share.isOneTime) {
      await storage.del(code);
    }

    return res.status(200).json({
      content: share.content,
      expiresIn: ttl,
      language: share.language,
      fileName: share.fileName,
      fileType: share.fileType,
      isOneTime: share.isOneTime
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
