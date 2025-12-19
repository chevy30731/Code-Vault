import type { ScanLog, ScanProfile } from '@/types/scanLog';
import { threatDetectionService } from './threatDetection';
import { qrService } from './qr';
import * as Clipboard from 'expo-clipboard';

export const scanLogService = {
  async createScanLog(
    data: string,
    profile: ScanProfile,
    location?: { latitude: number; longitude: number; accuracy: number }
  ): Promise<ScanLog> {
    const parsed = qrService.parseQRData(data);
    const threatLevel = threatDetectionService.analyzeThreat(data);

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      data,
      type: parsed.type,
      timestamp: Date.now(),
      location,
      profile,
      threatLevel,
      tags: [],
    };
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
