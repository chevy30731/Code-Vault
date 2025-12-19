import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ScanLog } from '@/types/scanLog';

export const exportService = {
  async exportToCSV(logs: ScanLog[], password?: string): Promise<boolean> {
    try {
      let csv = 'Timestamp,Type,Data,Location,Profile,Threat Level,Tags\n';
      
      logs.forEach((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        const location = log.location
          ? `"${log.location.latitude},${log.location.longitude}"`
          : '""';
        const tags = log.tags.join('|');
        
        csv += `${timestamp},"${log.type}","${log.data}",${location},"${log.profile}","${log.threatLevel}","${tags}"\n`;
      });

      const fileUri = `${FileSystem.cacheDirectory}codevault_export_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Export error:', error);
      return false;
    }
  },
};
