import type { QuantumQRCode, QuantumLayer, UnlockedLayer, LayerType } from '@/types/quantumQR';
import { encryptionService } from './encryption';

export const quantumQRService = {
  encodeQuantumQR(qr: QuantumQRCode): string {
    const encoded = JSON.stringify({
      id: qr.id,
      name: qr.name,
      layers: qr.layers.map((layer) => ({
        id: layer.id,
        type: layer.type,
        name: layer.name,
        data: layer.data,
        description: layer.description,
        scanLimit: layer.scanLimit,
        scanCount: layer.scanCount,
        expiresAt: layer.expiresAt,
      })),
    });
    return `QUANTUM:${Buffer.from(encoded).toString('base64')}`;
  },

  decodeQuantumQR(data: string): QuantumQRCode | null {
    try {
      if (!data.startsWith('QUANTUM:')) {
        return null;
      }
      const base64 = data.replace('QUANTUM:', '');
      const decoded = Buffer.from(base64, 'base64').toString();
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },

  async unlockAllLayers(
    qr: QuantumQRCode,
    pin: string,
    developerMode: boolean = false
  ): Promise<UnlockedLayer[]> {
    const unlocked: UnlockedLayer[] = [];

    for (const layer of qr.layers) {
      let isUnlocked = false;
      let decrypted: string | undefined;

      if (layer.type === 'public') {
        isUnlocked = true;
        decrypted = layer.data;
      } else if (layer.type === 'private' && pin) {
        try {
          decrypted = await encryptionService.decrypt(layer.data, pin);
          isUnlocked = true;
        } catch {
          isUnlocked = false;
        }
      } else if (layer.type === 'hidden' && developerMode && pin) {
        try {
          decrypted = await encryptionService.decrypt(layer.data, pin);
          isUnlocked = true;
        } catch {
          isUnlocked = false;
        }
      }

      // Check expiration
      if (layer.expiresAt && Date.now() > layer.expiresAt) {
        isUnlocked = false;
        decrypted = undefined;
      }

      // Check scan limit
      if (layer.scanLimit && layer.scanCount >= layer.scanLimit) {
        isUnlocked = false;
        decrypted = undefined;
      }

      unlocked.push({
        ...layer,
        unlocked: isUnlocked,
        decryptedData: decrypted,
        unlockedAt: isUnlocked ? Date.now() : undefined,
      });
    }

    return unlocked;
  },

  getLayerCount(qr: QuantumQRCode): { public: number; private: number; hidden: number } {
    return {
      public: qr.layers.filter((l) => l.type === 'public').length,
      private: qr.layers.filter((l) => l.type === 'private').length,
      hidden: qr.layers.filter((l) => l.type === 'hidden').length,
    };
  },

  async createLayer(
    type: LayerType,
    name: string,
    data: string,
    pin?: string,
    options?: {
      description?: string;
      scanLimit?: number;
      expiresAt?: number;
    }
  ): Promise<QuantumLayer> {
    let finalData = data;

    // Encrypt private and hidden layers
    if ((type === 'private' || type === 'hidden') && pin) {
      finalData = await encryptionService.encrypt(data, pin);
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      name,
      data: finalData,
      description: options?.description,
      scanLimit: options?.scanLimit,
      scanCount: 0,
      expiresAt: options?.expiresAt,
      createdAt: Date.now(),
    };
  },
};
