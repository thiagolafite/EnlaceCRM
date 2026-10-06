import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Deriva uma chave de 32 bytes a partir do segredo configurado
 */
function getDerivedKey(customKey?: string): Buffer {
  const secret = customKey || config.jwtSecret;
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Criptografa um texto em repouso usando AES-256-GCM
 */
export function encrypt(plainText: string, customKey?: string): EncryptedPayload {
  if (!plainText) {
    return { encrypted: '', iv: '', tag: '' };
  }

  const key = getDerivedKey(customKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Descriptografa um texto protegido por AES-256-GCM
 */
export function decrypt(encryptedText: string, ivHex: string, tagHex: string, customKey?: string): string {
  if (!encryptedText || !ivHex || !tagHex) {
    return '';
  }

  try {
    const key = getDerivedKey(customKey);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('❌ [Crypto] Falha ao descriptografar segredo:', err);
    return '';
  }
}
