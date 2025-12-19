import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export const qrImageService = {
  async shareQRCode(qrRef: any, filename: string = 'QRCode'): Promise<boolean> {
    try {
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      const fileUri = `${FileSystem.cacheDirectory}${filename}.png`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  },
};
