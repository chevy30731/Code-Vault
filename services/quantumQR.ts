import * as Crypto from 'expo-crypto';
import { encryptionService } from './encryption';
import type {
  QuantumQRCode,
  QuantumLayer,
  QuantumLayerConfig,
  UnlockedLayer,
} from '@/types/quantumQR';
import { QUANTUM_QR_PREFIX } from '@/types/quantumQR';

export const quantumQRService = {
  async generateQuantumQR(
    name: string,
    layerConfigs: QuantumLayerConfig[],
    systemPIN?: string
  ): Promise<QuantumQRCode> {
    const layers: QuantumLayer[] = [];

    for (const config of layerConfigs) {
      const layerId = await this.generateLayerId(config);
      
      let encrypted = false;
      let processedData = config.data;

      // Encrypt private and hidden layers
      if (config.type === 'private' || config.type === 'hidden') {
        if (!systemPIN) {
          throw new Error(`PIN required for ${config.type} layer`);
        }
        
        // Use layer-specific encryption key combining PIN and layer type
        const layerKey = `${systemPIN}_${config.type}_${layerId}`;
        processedData = await encryptionService.encryptData(config.data, layerKey);
        encrypted = true;
      }

      layers.push({
        id: layerId,
        type: config.type,
        name: config.name,
        data: processedData,
        encrypted,
        requiresAuth: config.type !== 'public',
        description: config.description,
      });
    }

    const quantumQR: QuantumQRCode = {
      id: `quantum_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      version: '1.0',
      name,
      layers,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return quantumQR;
  },

  async generateLayerId(config: QuantumLayerConfig): Promise<string> {
    const dataString = JSON.stringify({
      type: config.type,
      name: config.name,
      timestamp: Date.now(),
    });

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString
    );

    return `L-${hash.substring(0, 8).toUpperCase()}`;
  },

  encodeQuantumQR(quantumQR: QuantumQRCode): string {
    const compactData = {
      v: quantumQR.version,
      id: quantumQR.id,
      name: quantumQR.name,
      layers: quantumQR.layers.map((layer) => ({
        id: layer.id,
        t: layer.type,
        n: layer.name,
        d: layer.data,
        e: layer.encrypted,
        r: layer.requiresAuth,
        desc: layer.description,
      })),
      ts: quantumQR.createdAt,
    };

    return `${QUANTUM_QR_PREFIX}${JSON.stringify(compactData)}`;
  },

  decodeQuantumQR(qrData: string): QuantumQRCode | null {
    try {
      if (!qrData.startsWith(QUANTUM_QR_PREFIX)) {
        return null;
      }

      const jsonData = qrData.replace(QUANTUM_QR_PREFIX, '');
      const parsed = JSON.parse(jsonData);

      const layers: QuantumLayer[] = parsed.layers.map((layer: any) => ({
        id: layer.id,
        type: layer.t,
        name: layer.n,
        data: layer.d,
        encrypted: layer.e,
        requiresAuth: layer.r,
        description: layer.desc,
      }));

      return {
        id: parsed.id,
        version: parsed.v,
        name: parsed.name,
        layers,
        createdAt: parsed.ts,
        updatedAt: parsed.ts,
      };
    } catch (error) {
      console.error('Error decoding quantum QR:', error);
      return null;
    }
  },

  async unlockLayer(
    layer: QuantumLayer,
    pin: string,
    isDeveloperMode: boolean = false
  ): Promise<UnlockedLayer> {
    const unlockedLayer: UnlockedLayer = {
      ...layer,
      unlocked: false,
    };

    // Public layer - always unlocked
    if (layer.type === 'public') {
      unlockedLayer.unlocked = true;
      unlockedLayer.decryptedData = layer.data;
      unlockedLayer.unlockedAt = Date.now();
      return unlockedLayer;
    }

    // Hidden layer - requires developer mode
    if (layer.type === 'hidden' && !isDeveloperMode) {
      return unlockedLayer;
    }

    // Decrypt private/hidden layers
    if (layer.encrypted) {
      try {
        const layerKey = `${pin}_${layer.type}_${layer.id}`;
        const decrypted = await encryptionService.decryptData(layer.data, layerKey);
        
        unlockedLayer.decryptedData = decrypted;
        unlockedLayer.unlocked = true;
        unlockedLayer.unlockedAt = Date.now();
      } catch (error) {
        console.error('Failed to unlock layer:', error);
      }
    }

    return unlockedLayer;
  },

  async unlockAllLayers(
    quantumQR: QuantumQRCode,
    pin: string,
    isDeveloperMode: boolean = false
  ): Promise<UnlockedLayer[]> {
    const unlockedLayers: UnlockedLayer[] = [];

    for (const layer of quantumQR.layers) {
      const unlocked = await this.unlockLayer(layer, pin, isDeveloperMode);
      unlockedLayers.push(unlocked);
    }

    return unlockedLayers;
  },

  getPublicLayers(quantumQR: QuantumQRCode): QuantumLayer[] {
    return quantumQR.layers.filter((layer) => layer.type === 'public');
  },

  getPrivateLayers(quantumQR: QuantumQRCode): QuantumLayer[] {
    return quantumQR.layers.filter((layer) => layer.type === 'private');
  },

  getHiddenLayers(quantumQR: QuantumQRCode): QuantumLayer[] {
    return quantumQR.layers.filter((layer) => layer.type === 'hidden');
  },

  getLayerCount(quantumQR: QuantumQRCode): { public: number; private: number; hidden: number } {
    return {
      public: this.getPublicLayers(quantumQR).length,
      private: this.getPrivateLayers(quantumQR).length,
      hidden: this.getHiddenLayers(quantumQR).length,
    };
  },
};
