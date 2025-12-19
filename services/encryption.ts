import * as Crypto from 'expo-crypto';

export const encryptionService = {
  async encrypt(data: string, password: string): Promise<string> {
    try {
      // Simple XOR-based encryption for demo
      // In production, use proper AES encryption
      const key = await this.deriveKey(password);
      const encrypted = this.xorEncrypt(data, key);
      return Buffer.from(encrypted).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  },

  async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      const key = await this.deriveKey(password);
      const encrypted = Buffer.from(encryptedData, 'base64').toString();
      return this.xorEncrypt(encrypted, key);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  },

  async deriveKey(password: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return hash;
  },

  xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  },
};
