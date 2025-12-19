import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PremiumStatus } from '@/types/qr';
import type { ScanLog } from '@/types/scanLog';
import type { Artifact } from '@/types/artifact';
import type { QuantumQRCode } from '@/types/quantumQR';

const KEYS = {
  PREMIUM_STATUS: '@codevault_premium',
  PIN: '@codevault_pin',
  SCAN_LOGS: '@codevault_scans',
  ARTIFACTS: '@codevault_artifacts',
  QUANTUM_QRS: '@codevault_quantum',
};

export const storageService = {
  // Premium Status
  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PREMIUM_STATUS);
      if (data) {
        return JSON.parse(data);
      }
      return { isPremium: false, generationCount: 0 };
    } catch {
      return { isPremium: false, generationCount: 0 };
    }
  },

  async setPremiumStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PREMIUM_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  },

  async incrementGenerationCount(): Promise<number> {
    const status = await this.getPremiumStatus();
    const newCount = status.generationCount + 1;
    await this.setPremiumStatus({ ...status, generationCount: newCount });
    return newCount;
  },

  // PIN Management
  async getPIN(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.PIN);
    } catch {
      return null;
    }
  },

  async setPIN(pin: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PIN, pin);
    } catch (error) {
      console.error('Error saving PIN:', error);
    }
  },

  async removePIN(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.PIN);
    } catch (error) {
      console.error('Error removing PIN:', error);
    }
  },

  // Scan Logs
  async getScanLogs(): Promise<ScanLog[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCAN_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addScanLog(log: ScanLog): Promise<void> {
    try {
      const logs = await this.getScanLogs();
      logs.unshift(log);
      await AsyncStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving scan log:', error);
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
      await AsyncStorage.removeItem(KEYS.SCAN_LOGS);
    } catch (error) {
      console.error('Error clearing scan logs:', error);
    }
  },

  // Artifacts
  async getArtifacts(): Promise<Artifact[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ARTIFACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addArtifact(artifact: Artifact): Promise<void> {
    try {
      const artifacts = await this.getArtifacts();
      artifacts.unshift(artifact);
      await AsyncStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(artifacts));
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  },

  async updateArtifact(artifact: Artifact): Promise<void> {
    try {
      const artifacts = await this.getArtifacts();
      const index = artifacts.findIndex((a) => a.id === artifact.id);
      if (index !== -1) {
        artifacts[index] = { ...artifact, updatedAt: Date.now() };
        await AsyncStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(artifacts));
      }
    } catch (error) {
      console.error('Error updating artifact:', error);
    }
  },

  async deleteArtifact(id: string): Promise<void> {
    try {
      const artifacts = await this.getArtifacts();
      const filtered = artifacts.filter((a) => a.id !== id);
      await AsyncStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting artifact:', error);
    }
  },

  // Quantum QR Codes
  async getQuantumQRs(): Promise<QuantumQRCode[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUANTUM_QRS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addQuantumQR(qr: QuantumQRCode): Promise<void> {
    try {
      const qrs = await this.getQuantumQRs();
      qrs.unshift(qr);
      await AsyncStorage.setItem(KEYS.QUANTUM_QRS, JSON.stringify(qrs));
    } catch (error) {
      console.error('Error saving quantum QR:', error);
    }
  },

  async deleteQuantumQR(id: string): Promise<void> {
    try {
      const qrs = await this.getQuantumQRs();
      const filtered = qrs.filter((qr) => qr.id !== id);
      await AsyncStorage.setItem(KEYS.QUANTUM_QRS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting quantum QR:', error);
    }
  },
};
