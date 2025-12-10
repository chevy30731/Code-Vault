import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PremiumStatus, PINConfig, SavedQRCode, QRCategory } from '@/types/qr';
import type { ArtifactMetadata } from '@/types/artifact';
import type { QuantumQRCode } from '@/types/quantumQR';
import type { ScanLog, ScanProfile } from '@/types/scanLog';
import { DEFAULT_CATEGORIES } from '@/types/qr';

const KEYS = {
  PREMIUM_STATUS: '@code_vault_premium',
  PIN_CONFIG: '@code_vault_pin',
  GENERATION_COUNT: '@code_vault_gen_count',
  SAVED_QR_CODES: '@code_vault_saved_qr',
  CATEGORIES: '@code_vault_categories',
  QUANTUM_QR_CODES: '@code_vault_quantum_qr',
  SCAN_LOGS: '@code_vault_scan_logs',
  SCAN_PROFILE: '@code_vault_scan_profile',
};

export const storageService = {
  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PREMIUM_STATUS);
      if (data) {
        return JSON.parse(data);
      }
      return { isPremium: false, generationCount: 0 };
    } catch (error) {
      console.error('Error getting premium status:', error);
      return { isPremium: false, generationCount: 0 };
    }
  },

  async setPremiumStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PREMIUM_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error setting premium status:', error);
    }
  },

  async incrementGenerationCount(): Promise<number> {
    try {
      const status = await this.getPremiumStatus();
      const newCount = status.generationCount + 1;
      await this.setPremiumStatus({ ...status, generationCount: newCount });
      return newCount;
    } catch (error) {
      console.error('Error incrementing count:', error);
      return 0;
    }
  },

  async getPINConfig(): Promise<PINConfig> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PIN_CONFIG);
      if (data) {
        return JSON.parse(data);
      }
      return { enabled: false, pin: '' };
    } catch (error) {
      console.error('Error getting PIN config:', error);
      return { enabled: false, pin: '' };
    }
  },

  async setPINConfig(config: PINConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PIN_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error setting PIN config:', error);
    }
  },

  async verifyPIN(pin: string): Promise<boolean> {
    try {
      const config = await this.getPINConfig();
      return config.enabled && config.pin === pin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  },

  async getSavedQRCodes(): Promise<SavedQRCode[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_QR_CODES);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting saved QR codes:', error);
      return [];
    }
  },

  async saveQRCode(qrCode: SavedQRCode): Promise<void> {
    try {
      const codes = await this.getSavedQRCodes();
      codes.unshift(qrCode);
      await AsyncStorage.setItem(KEYS.SAVED_QR_CODES, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  },

  async deleteQRCode(id: string): Promise<void> {
    try {
      const codes = await this.getSavedQRCodes();
      const filtered = codes.filter((code) => code.id !== id);
      await AsyncStorage.setItem(KEYS.SAVED_QR_CODES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  },

  async getCategories(): Promise<QRCategory[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
      await this.setCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  async setCategories(categories: QRCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error setting categories:', error);
    }
  },

  async addCategory(category: QRCategory): Promise<void> {
    try {
      const categories = await this.getCategories();
      categories.push(category);
      await this.setCategories(categories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  },

  // Artifact Storage
  async saveArtifact(artifact: ArtifactMetadata): Promise<void> {
    try {
      const artifacts = await this.getArtifacts();
      const existingIndex = artifacts.findIndex((a) => a.id === artifact.id);

      if (existingIndex >= 0) {
        artifacts[existingIndex] = artifact;
      } else {
        artifacts.push(artifact);
      }

      await AsyncStorage.setItem('@code_vault_artifacts', JSON.stringify(artifacts));
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  },

  async getArtifacts(): Promise<ArtifactMetadata[]> {
    try {
      const data = await AsyncStorage.getItem('@code_vault_artifacts');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting artifacts:', error);
      return [];
    }
  },

  async getArtifact(id: string): Promise<ArtifactMetadata | null> {
    try {
      const artifacts = await this.getArtifacts();
      return artifacts.find((a) => a.id === id) || null;
    } catch (error) {
      console.error('Error getting artifact:', error);
      return null;
    }
  },

  async deleteArtifact(id: string): Promise<void> {
    try {
      const artifacts = await this.getArtifacts();
      const filtered = artifacts.filter((a) => a.id !== id);
      await AsyncStorage.setItem('@code_vault_artifacts', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting artifact:', error);
    }
  },

  async getArtifactCount(): Promise<number> {
    try {
      const artifacts = await this.getArtifacts();
      return artifacts.length;
    } catch (error) {
      console.error('Error getting artifact count:', error);
      return 0;
    }
  },

  // Quantum QR Storage
  async saveQuantumQR(quantumQR: QuantumQRCode): Promise<void> {
    try {
      const quantumQRs = await this.getQuantumQRs();
      const existingIndex = quantumQRs.findIndex((q) => q.id === quantumQR.id);

      if (existingIndex >= 0) {
        quantumQRs[existingIndex] = quantumQR;
      } else {
        quantumQRs.push(quantumQR);
      }

      await AsyncStorage.setItem(KEYS.QUANTUM_QR_CODES, JSON.stringify(quantumQRs));
    } catch (error) {
      console.error('Error saving quantum QR:', error);
    }
  },

  async getQuantumQRs(): Promise<QuantumQRCode[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUANTUM_QR_CODES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting quantum QRs:', error);
      return [];
    }
  },

  async getQuantumQR(id: string): Promise<QuantumQRCode | null> {
    try {
      const quantumQRs = await this.getQuantumQRs();
      return quantumQRs.find((q) => q.id === id) || null;
    } catch (error) {
      console.error('Error getting quantum QR:', error);
      return null;
    }
  },

  async deleteQuantumQR(id: string): Promise<void> {
    try {
      const quantumQRs = await this.getQuantumQRs();
      const filtered = quantumQRs.filter((q) => q.id !== id);
      await AsyncStorage.setItem(KEYS.QUANTUM_QR_CODES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting quantum QR:', error);
    }
  },

  // Scan Logs
  async saveScanLog(scanLog: ScanLog): Promise<void> {
    try {
      const logs = await this.getScanLogs();
      logs.unshift(scanLog);
      // Keep last 1000 scans
      const trimmed = logs.slice(0, 1000);
      await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving scan log:', error);
    }
  },

  async getScanLogs(): Promise<ScanLog[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCAN_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scan logs:', error);
      return [];
    }
  },

  async deleteScanLog(id: string): Promise<void> {
    try {
      const logs = await this.getScanLogs();
      const filtered = logs.filter((log) => log.id !== id);
      await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting scan log:', error);
    }
  },

  async clearScanLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing scan logs:', error);
    }
  },

  // Scan Profile
  async setScanProfile(profile: ScanProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCAN_PROFILE, profile);
    } catch (error) {
      console.error('Error setting scan profile:', error);
    }
  },

  async getScanProfile(): Promise<ScanProfile> {
    try {
      const profile = await AsyncStorage.getItem(KEYS.SCAN_PROFILE);
      return (profile as ScanProfile) || 'standard';
    } catch (error) {
      console.error('Error getting scan profile:', error);
      return 'standard';
    }
  },
};