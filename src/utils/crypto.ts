const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 1000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  ciphertext: string;
  salt: string;
  iv: string;
}

export async function encryptData(text: string, password: string): Promise<EncryptedPayload> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    encoder.encode(text)
  );

  return {
    ciphertext: bufToBase64(encrypted),
    salt: bufToBase64(salt),
    iv: bufToBase64(iv)
  };
}

export async function decryptData(payload: EncryptedPayload, password: string): Promise<string> {
  try {
    const salt = new Uint8Array(base64ToBuf(payload.salt));
    const iv = new Uint8Array(base64ToBuf(payload.iv));
    const ciphertext = base64ToBuf(payload.ciphertext);

    const key = await deriveKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      ciphertext
    );

    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Invalid Password');
  }
}
