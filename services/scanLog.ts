import type { ScanLog, ScanProfile, ThreatLevel } from '@/types/scanLog';
import { threatDetectionService } from './threatDetection';
import { qrService } from './qr';
import { storageService } from './storage';
import { encryptionService } from './encryption';
import * as Clipboard from 'expo-clipboard';

export const scanLogService = {
  async createScanLog(
    type: string,
    data: string,
    profile: ScanProfile,
    options?: {
      addGPS?: boolean;
      threatLevel?: ThreatLevel;
    }
  ): Promise<ScanLog> {
    const log: ScanLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      data,
      type,
      timestamp: Date.now(),
      profile,
      threatLevel: options?.threatLevel || 'safe',
      tags: [],
    };

    // Add GPS if requested and available
    if (options?.addGPS) {
      try {
        // GPS functionality is optional - would require expo-location
        // For now, we'll skip GPS to avoid blank screens
      } catch (error) {
        console.warn('GPS not available:', error);
      }
    }

    await storageService.addScanLog(log);
    return log;
  },

  async getScanLogs(): Promise<ScanLog[]> {
    return storageService.getScanLogs();
  },

  async deleteScanLog(id: string): Promise<void> {
    return storageService.deleteScanLog(id);
  },

  async clearAllLogs(): Promise<void> {
    return storageService.clearScanLogs();
  },

  async exportLogs(encrypted: boolean = false, password?: string): Promise<string> {
    const logs = await this.getScanLogs();
    const jsonData = JSON.stringify(logs, null, 2);

    if (encrypted && password) {
      return encryptionService.encrypt(jsonData, password);
    }

    return jsonData;
  },

  async handleScanAction(log: ScanLog): Promise<void> {
    switch (log.profile) {
      case 'silent':
        await Clipboard.setStringAsync(log.data);
        break;
      
      case 'wallet':
        // In a real app, this would open the crypto wallet app
        await Clipboard.setStringAsync(log.data);
        break;
      
      case 'legacy':
      case 'artifact':
        // These are handled in the UI with additional inputs
        break;
      
      case 'standard':
      default:
        // Show preview
        break;
    }
  },
};
