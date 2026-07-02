import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class InMemoryStorage {
  constructor() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
    console.log('Storage: Using In-Memory Storage system.');
  }

  async set(key, value, ttlSeconds) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async getTTL(key) {
    const entry = this.store.get(key);
    if (!entry) return -2;

    const remainingMs = entry.expiresAt - Date.now();
    if (remainingMs <= 0) {
      this.store.delete(key);
      return -2;
    }

    return Math.ceil(remainingMs / 1000);
  }

  cleanup() {
    const now = Date.now();
    let expiredCount = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        expiredCount++;
      }
    }
    if (expiredCount > 0) {
      console.log(`Storage cleanup: Removed ${expiredCount} expired items from memory.`);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

class RedisStorage {
  constructor(client) {
    this.client = client;
    console.log('Storage: Using Redis Storage system.');
  }

  async set(key, value, ttlSeconds) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await this.client.set(key, stringValue, { EX: ttlSeconds });
  }

  async get(key) {
    return await this.client.get(key);
  }

  async del(key) {
    return await this.client.del(key);
  }

  async getTTL(key) {
    return await this.client.ttl(key);
  }
}

let storageInstance = null;

export async function initStorage() {
  if (storageInstance) return storageInstance;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url: redisUrl });

  client.on('error', () => {});

  try {
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);

    storageInstance = new RedisStorage(client);
  } catch (error) {
    console.warn(`\n⚠️ Storage Warning: Failed to connect to Redis (${redisUrl}).`);
    console.warn('Falling back to local in-memory storage. Snippets will not persist across server restarts.\n');
    storageInstance = new InMemoryStorage();
  }

  return storageInstance;
}

export async function getStorage() {
  if (!storageInstance) {
    return await initStorage();
  }
  return storageInstance;
}
