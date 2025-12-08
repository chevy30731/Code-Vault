import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const imageCompressionService = {
  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    try {
      // Resize and compress
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Max width 800px
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  },

  async compressMultipleImages(
    uris: string[],
    quality: number = 0.7
  ): Promise<string[]> {
    const compressed: string[] = [];

    for (const uri of uris) {
      try {
        const result = await this.compressImage(uri, quality);
        compressed.push(result);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }

    return compressed;
  },

  getImageSize(base64: string): number {
    // Calculate approximate size in KB
    return Math.round((base64.length * 0.75) / 1024);
  },
};
