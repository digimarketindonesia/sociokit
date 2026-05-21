import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

export class CryptoUtil {
  /**
   * Encrypt a string using AES-256
   */
  static encrypt(text: string): string {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypt a string using AES-256
   */
  static decrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt JSON object
   */
  static encryptJson(data: object): string {
    return this.encrypt(JSON.stringify(data));
  }

  /**
   * Decrypt JSON object
   */
  static decryptJson<T = any>(ciphertext: string): T {
    const decrypted = this.decrypt(ciphertext);
    return JSON.parse(decrypted);
  }

  /**
   * Generate random affiliate code
   */
  static generateAffiliateCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random slug for shortlinks
   */
  static generateSlug(length: number = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
