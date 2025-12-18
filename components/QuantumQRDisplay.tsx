import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { quantumQRService } from '@/services/quantumQR';
import { qrImageService } from '@/services/qrImage';
import { PINInput } from './PINInput';
import type { QuantumQRCode, UnlockedLayer } from '@/types/quantumQR';
import { LAYER_TYPES } from '@/types/quantumQR';

interface QuantumQRDisplayProps {
  quantumQR: QuantumQRCode;
  systemPIN?: string;
  onClose: () => void;
}

export function QuantumQRDisplay({ quantumQR, systemPIN, onClose }: QuantumQRDisplayProps) {
  const [unlockedLayers, setUnlockedLayers] = useState<UnlockedLayer[]>([]);
  const [showPINInput, setShowPINInput] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const insets = useSafeAreaInsets();
  const qrRef = useRef(null);

  // Initialize with public layers unlocked
  React.useEffect(() => {
    initializeLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeLayers = async () => {
    const unlocked = await quantumQRService.unlockAllLayers(quantumQR, '', false);
    setUnlockedLayers(unlocked);
  };

  const handleUnlockPrivate = async (pin: string) => {
    if (!systemPIN || pin !== systemPIN) {
      Alert.alert('Error', 'Invalid PIN');
      return;
    }

    const unlocked = await quantumQRService.unlockAllLayers(quantumQR, pin, developerMode);
    setUnlockedLayers(unlocked);
    setShowPINInput(false);
    Alert.alert('Success', 'Private layers unlocked');
  };

  const handleEnableDeveloperMode = () => {
    Alert.alert(
      'Developer Mode',
      'Enable developer mode to reveal hidden layers? This will require PIN authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enable',
          onPress: () => {
            setDeveloperMode(true);
            setShowPINInput(true);
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await qrImageService.shareQRCode(qrRef, quantumQR.name);
      if (!success) {
        Alert.alert('Error', 'Could not share QR code');
      }
    } catch {
      Alert.alert('Error', 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const getQRData = () => {
    return quantumQRService.encodeQuantumQR(quantumQR);
  };

  const layerCounts = quantumQRService.getLayerCount(quantumQR);
  const currentLayer = unlockedLayers[selectedLayerIndex];
  const layerType = currentLayer
    ? LAYER_TYPES.find((t) => t.type === currentLayer.type)
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="layers" size={28} color="#00D9FF" />
          <View style={styles.headerText}>
            <Text style={styles.title}>{quantumQR.name}</Text>
            <Text style={styles.subtitle}>
              {layerCounts.public}P • {layerCounts.private}Pr • {layerCounts.hidden}H
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrContainer} ref={qrRef}>
          <QRCode value={getQRData()} size={250} color="#000000" backgroundColor="#FFFFFF" />
        </View>

        <View style={styles.layerSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {unlockedLayers.map((layer, index) => {
              const type = LAYER_TYPES.find((t) => t.type === layer.type);
              return (
                <TouchableOpacity
                  key={layer.id}
                  style={[
                    styles.layerTab,
                    selectedLayerIndex === index && styles.layerTabActive,
                    !layer.unlocked && styles.layerTabLocked,
                  ]}
                  onPress={() => setSelectedLayerIndex(index)}
                >
                  <MaterialIcons
                    name={layer.unlocked ? (type?.icon as any) : 'lock'}
                    size={16}
                    color={layer.unlocked ? type?.color : '#666666'}
                  />
                  <Text
                    style={[
                      styles.layerTabText,
                      selectedLayerIndex === index && styles.layerTabTextActive,
                      !layer.unlocked && styles.layerTabTextLocked,
                    ]}
                  >
                    {layer.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {currentLayer && (
          <View style={styles.layerContent}>
            <View style={styles.layerContentHeader}>
              {layerType && (
                <View style={styles.layerBadge}>
                  <MaterialIcons
                    name={layerType.icon as any}
                    size={16}
                    color={layerType.color}
                  />
                  <Text style={[styles.layerBadgeText, { color: layerType.color }]}>
                    {layerType.label}
                  </Text>
                </View>
              )}
            </View>

            {currentLayer.description && (
              <Text style={styles.layerDescription}>{currentLayer.description}</Text>
            )}

            {currentLayer.unlocked ? (
              <View style={styles.dataContainer}>
                <Text style={styles.dataLabel}>Data:</Text>
                <Text style={styles.dataText}>{currentLayer.decryptedData || currentLayer.data}</Text>
                {currentLayer.unlockedAt && (
                  <Text style={styles.dataTimestamp}>
                    Unlocked: {new Date(currentLayer.unlockedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.lockedContainer}>
                <MaterialIcons name="lock" size={48} color="#666666" />
                <Text style={styles.lockedText}>Layer Locked</Text>
                <Text style={styles.lockedDescription}>
                  {currentLayer.type === 'private'
                    ? 'Enter PIN to unlock this layer'
                    : 'Enable developer mode to access'}
                </Text>
                {currentLayer.type === 'private' ? (
                  <TouchableOpacity
                    style={styles.unlockButton}
                    onPress={() => setShowPINInput(true)}
                  >
                    <MaterialIcons name="lock-open" size={20} color="#000000" />
                    <Text style={styles.unlockButtonText}>Unlock with PIN</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.unlockButton, styles.developerButton]}
                    onPress={handleEnableDeveloperMode}
                  >
                    <MaterialIcons name="code" size={20} color="#FFFFFF" />
                    <Text style={[styles.unlockButtonText, { color: '#FFFFFF' }]}>
                      Enable Developer Mode
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <MaterialIcons name="share" size={20} color="#000000" />
            <Text style={styles.shareButtonText}>
              {isSharing ? 'Sharing...' : 'Share QR'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPINInput} animationType="slide" transparent>
        <View style={styles.pinModal}>
          <View style={styles.pinContent}>
            <Text style={styles.pinTitle}>Enter PIN</Text>
            <Text style={styles.pinMessage}>
              Enter your Code Vault PIN to unlock {developerMode ? 'all' : 'private'} layers
            </Text>
            <PINInput
              length={4}
              onComplete={handleUnlockPrivate}
              onCancel={() => {
                setShowPINInput(false);
                setDeveloperMode(false);
              }}
            />
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
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
  layerSelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  layerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  layerTabActive: {
    backgroundColor: '#00D9FF22',
    borderColor: '#00D9FF',
  },
  layerTabLocked: {
    backgroundColor: '#1A1A2E',
    borderColor: '#66666633',
  },
  layerTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  layerTabTextActive: {
    color: '#00D9FF',
  },
  layerTabTextLocked: {
    color: '#666666',
  },
  layerContent: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  layerContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  layerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    gap: 6,
  },
  layerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  layerDescription: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  dataContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
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
    color: '#FFFFFF',
    lineHeight: 20,
  },
  dataTimestamp: {
    fontSize: 11,
    color: '#666666',
    marginTop: 8,
  },
  lockedContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#66666633',
  },
  lockedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  lockedDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D9FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  developerButton: {
    backgroundColor: '#FF4444',
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  actions: {
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#00D9FF',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  pinModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  pinContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  pinMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 24,
    textAlign: 'center',
  },
});
