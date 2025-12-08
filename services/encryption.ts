import * as Crypto from 'expo-crypto';

export const encryptionService = {
  async encryptData(data: string, passkey: string): Promise<string> {
    try {
      // Simple encryption using SHA-256 hash of passkey as key
      const keyHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passkey
      );
      
      // Encode data with key (XOR-like operation for demo)
      const encrypted = Buffer.from(data)
        .toString('base64')
        .split('')
        .map((char, i) => {
          const keyChar = keyHash[i % keyHash.length];
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
        })
        .join('');
      
      return Buffer.from(encrypted).toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  async decryptData(encryptedData: string, passkey: string): Promise<string> {
    try {
      const keyHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passkey
      );
      
      const decoded = Buffer.from(encryptedData, 'base64').toString();
      const decrypted = decoded
        .split('')
        .map((char, i) => {
          const keyChar = keyHash[i % keyHash.length];
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
        })
        .join('');
      
      return Buffer.from(decrypted, 'base64').toString();
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  },

  generatePasskey(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },
};