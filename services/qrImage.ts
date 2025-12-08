import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export const qrImageService = {
  async captureQRCode(viewRef: any): Promise<string | null> {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      return uri;
    } catch (error) {
      console.error('Error capturing QR code:', error);
      return null;
    }
  },

  async shareQRCode(viewRef: any, name?: string): Promise<boolean> {
    try {
      const uri = await this.captureQRCode(viewRef);
      if (!uri) return false;

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Sharing is not available on this device');
        return false;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: name ? `Share ${name}` : 'Share QR Code',
        UTI: 'public.png',
      });

      return true;
    } catch (error) {
      console.error('Error sharing QR code:', error);
      return false;
    }
  },

  async saveToDevice(viewRef: any, name: string): Promise<boolean> {
    try {
      const uri = await this.captureQRCode(viewRef);
      if (!uri) return false;

      const fileName = `${name}_${Date.now()}.png`;
      const destPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: destPath,
      });

      return true;
    } catch (error) {
      console.error('Error saving QR code:', error);
      return false;
    }
  },
};
