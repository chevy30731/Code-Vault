import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { qrImageService } from '@/services/qrImage';

interface QRDisplayProps {
  data: string;
  title?: string;
  onClose: () => void;
  color?: string;
  backgroundColor?: string;
  showShare?: boolean;
}

export function QRDisplay({ 
  data, 
  title = 'QR Code', 
  onClose,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  showShare = true,
}: QRDisplayProps) {
  const insets = useSafeAreaInsets();
  const qrRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await qrImageService.shareQRCode(qrRef, title);
      if (!success) {
        Alert.alert('Error', 'Could not share QR code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrContainer} ref={qrRef}>
          <QRCode 
            value={data} 
            size={250}
            color={color}
            backgroundColor={backgroundColor}
          />
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Data:</Text>
          <Text style={styles.dataText}>{data}</Text>
        </View>

        <View style={styles.actions}>
          {showShare && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]} 
              onPress={handleShare}
              disabled={isSharing}
            >
              <MaterialIcons name="share" size={24} color="#000000" />
              <Text style={[styles.actionText, styles.shareText]}>
                {isSharing ? 'Sharing...' : 'Share QR Code'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  dataContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9FF',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
  },
  shareButton: {
    backgroundColor: '#00D9FF',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareText: {
    color: '#000000',
  },
});
