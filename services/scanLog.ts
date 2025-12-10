import * as Location from 'expo-location';
import { storageService } from './storage';
import type { ScanLog, ScanProfile } from '@/types/scanLog';

export const scanLogService = {
  async createScanLog(
    type: ScanLog['type'],
    data: string,
    profile: ScanProfile,
    options: {
      addGPS?: boolean;
      tags?: string[];
      threatLevel?: ScanLog['threatLevel'];
      metadata?: ScanLog['metadata'];
    } = {}
  ): Promise<ScanLog> {
    let location: ScanLog['location'] | undefined;

    if (options.addGPS) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy || undefined,
          };
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }

    const scanLog: ScanLog = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      data,
      location,
      tags: options.tags,
      threatLevel: options.threatLevel || 'safe',
      profile,
      metadata: options.metadata,
    };

    await storageService.saveScanLog(scanLog);
    return scanLog;
  },

  async getScanLogs(filter?: {
    type?: ScanLog['type'];
    profile?: ScanProfile;
    startDate?: number;
    endDate?: number;
    threatLevel?: ScanLog['threatLevel'];
  }): Promise<ScanLog[]> {
    const logs = await storageService.getScanLogs();

    if (!filter) return logs;

    return logs.filter((log) => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.profile && log.profile !== filter.profile) return false;
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      if (filter.threatLevel && log.threatLevel !== filter.threatLevel) return false;
      return true;
    });
  },

  async deleteScanLog(id: string): Promise<void> {
    await storageService.deleteScanLog(id);
  },

  async clearAllLogs(): Promise<void> {
    await storageService.clearScanLogs();
  },

  async exportLogs(encrypted: boolean = false, password?: string): Promise<string> {
    const logs = await storageService.getScanLogs();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalScans: logs.length,
      logs: logs.map((log) => ({
        timestamp: new Date(log.timestamp).toISOString(),
        type: log.type,
        data: log.data,
        location: log.location,
        tags: log.tags,
        threatLevel: log.threatLevel,
        profile: log.profile,
        metadata: log.metadata,
      })),
    };

    let content = JSON.stringify(exportData, null, 2);

    if (encrypted && password) {
      // Simple XOR encryption for demo - in production use proper encryption
      const encrypted = this.simpleEncrypt(content, password);
      content = `CODEVAULT_ENCRYPTED:${encrypted}`;
    }

    return content;
  },

  simpleEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(result, 'binary').toString('base64');
  },

  simpleDecrypt(encrypted: string, key: string): string {
    const binary = Buffer.from(encrypted, 'base64').toString('binary');
    let result = '';
    for (let i = 0; i < binary.length; i++) {
      result += String.fromCharCode(binary.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  },
};
