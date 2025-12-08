import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Alert, ScrollView, Animated } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Optional dependencies - removed to prevent blank screen
// import * as LocalAuthentication from 'expo-local-authentication';
// import * as Clipboard from 'expo-clipboard';
import { qrService } from '@/services/qr';
import { artifactService } from '@/services/artifact';
import { quantumQRService } from '@/services/quantumQR';
import { storageService } from '@/services/storage';
import type { QRData } from '@/types/qr';
import { ARTIFACT_TYPES } from '@/types/artifact';
import type { QuantumQRCode, UnlockedLayer } from '@/types/quantumQR';
import { LAYER_TYPES, QUANTUM_QR_PREFIX } from '@/types/quantumQR';
import { PINInput } from '@/components/PINInput';

function QuantumResultView({
  quantumQR,
  unlockedLayers,
  onUnlock,
  onUnlockBiometric,
  developerMode,
  onToggleDeveloperMode,
  onReload,
}: {
  quantumQR: QuantumQRCode;
  unlockedLayers: UnlockedLayer[];
  onUnlock: () => void;
  onUnlockBiometric: () => void;
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
  onReload: () => void;
}) {
  const layerCounts = quantumQRService.getLayerCount(quantumQR);
  const [unlockingLayer, setUnlockingLayer] = useState<string | null>(null);
  const slideAnim = useState(new Animated.Value(0))[0];
  const glitchAnim = useState(new Animated.Value(0))[0];

  const handleCopy = async (data: string) => {
    // Clipboard disabled - optional dependency
    Alert.alert('Copy', `Data: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
  };

  const handleOpen = async (data: string) => {
    try {
      if (data.startsWith('http') || data.startsWith('mailto:') || data.startsWith('sms:')) {
        await Linking.openURL(data);
      } else {
        Alert.alert('Info', 'This data type cannot be opened directly');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open this link');
    }
  };

  const animateLayerReveal = (layerType: string) => {
    if (layerType === 'private') {
      // Slide up animation for private layers
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else if (layerType === 'hidden') {
      // Glitch animation for hidden layers
      Animated.sequence([
        Animated.timing(glitchAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  useEffect(() => {
    if (unlockedLayers.some(l => l.unlocked && l.type !== 'public')) {
      const lastUnlocked = unlockedLayers.find(l => l.unlocked && l.type !== 'public');
      if (lastUnlocked) {
        animateLayerReveal(lastUnlocked.type);
      }
    }
  }, [unlockedLayers]);

  return (
    <View style={styles.quantumResult}>
      <View style={styles.quantumHeader}>
        <MaterialIcons name="layers" size={24} color="#9C27B0" />
        <Text style={styles.quantumTitle}>{quantumQR.name}</Text>
      </View>

      <View style={styles.quantumStats}>
        <View style={styles.statBadge}>
          <MaterialIcons name="public" size={16} color="#00D9FF" />
          <Text style={styles.statText}>{layerCounts.public} Public</Text>
        </View>
        <View style={styles.statBadge}>
          <MaterialIcons name="lock" size={16} color="#FFD700" />
          <Text style={styles.statText}>{layerCounts.private} Private</Text>
        </View>
        <View style={styles.statBadge}>
          <MaterialIcons name="lock-outline" size={16} color="#FF4444" />
          <Text style={styles.statText}>{layerCounts.hidden} Hidden</Text>
        </View>
      </View>

      {/* Developer Mode Toggle */}
      {layerCounts.hidden > 0 && (
        <TouchableOpacity 
          style={styles.developerToggle}
          onPress={onToggleDeveloperMode}
        >
          <MaterialIcons 
            name={developerMode ? "code" : "code-off"} 
            size={20} 
            color={developerMode ? "#FF4444" : "#666666"} 
          />
          <Text style={[styles.developerText, developerMode && styles.developerTextActive]}>
            Developer Mode {developerMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Developer Warning Banner */}
      {developerMode && (
        <View style={styles.warningBanner}>
          <MaterialIcons name="warning" size={20} color="#FF4444" />
          <Text style={styles.warningText}>Developer Layer — advanced use only</Text>
        </View>
      )}

      {/* Layer Cards */}
      {unlockedLayers.map((layer) => {
        const layerType = LAYER_TYPES.find((t) => t.type === layer.type);
        const isHidden = layer.type === 'hidden';
        const shouldShow = !isHidden || developerMode;

        if (!shouldShow) return null;

        return (
          <Animated.View 
            key={layer.id} 
            style={[
              styles.layerCard,
              layer.type === 'private' && layer.unlocked && {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
                opacity: slideAnim,
              },
              layer.type === 'hidden' && layer.unlocked && {
                transform: [{
                  translateX: glitchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 5],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.layerCardHeader}>
              <View style={styles.layerCardLeft}>
                <MaterialIcons
                  name={layerType?.icon as any}
                  size={20}
                  color={layerType?.color}
                />
                <Text style={styles.layerCardName}>{layer.name}</Text>
              </View>
              {layer.type === 'private' && layer.unlocked && (
                <View style={styles.sovereignSeal}>
                  <MaterialIcons name="verified" size={20} color="#FFD700" />
                </View>
              )}
              {!layer.unlocked && (
                <MaterialIcons name="lock" size={20} color="#666666" />
              )}
            </View>

            {layer.description && (
              <Text style={styles.layerDescription}>{layer.description}</Text>
            )}

            {layer.unlocked ? (
              <>
                <View style={styles.layerDataContainer}>
                  <Text style={styles.layerDataText}>
                    {layer.decryptedData || layer.data}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.layerActions}>
                  {layer.type === 'public' && (
                    <TouchableOpacity 
                      style={styles.layerActionButton}
                      onPress={() => handleOpen(layer.decryptedData || layer.data)}
                    >
                      <MaterialIcons name="open-in-new" size={16} color="#00D9FF" />
                      <Text style={styles.layerActionText}>Open</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.layerActionButton}
                    onPress={() => handleCopy(layer.decryptedData || layer.data)}
                  >
                    <MaterialIcons name="content-copy" size={16} color="#00D9FF" />
                    <Text style={styles.layerActionText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.layerLocked}>
                <MaterialIcons name="lock" size={32} color="#666666" />
                <Text style={styles.layerLockedText}>
                  {layer.type === 'private' ? 'Requires Biometric or PIN' : 'Enable Developer Mode'}
                </Text>
                {layer.type === 'private' && (
                  <TouchableOpacity 
                    style={styles.biometricButton}
                    onPress={onUnlockBiometric}
                  >
                    <MaterialIcons name="fingerprint" size={20} color="#FFD700" />
                    <Text style={styles.biometricButtonText}>Unlock with Biometric</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
        );
      })}

      {/* PIN Unlock Fallback */}
      {layerCounts.private > 0 && unlockedLayers.some((l) => !l.unlocked && l.type === 'private') && (
        <TouchableOpacity style={styles.pinUnlockButton} onPress={onUnlock}>
          <MaterialIcons name="dialpad" size={16} color="#FFFFFF" />
          <Text style={styles.pinUnlockText}>Or unlock with PIN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ArtifactResultView({ data }: { data: string }) {
  const artifact = artifactService.decodeArtifactQR(data);
  
  if (!artifact) {
    return (
      <View style={styles.resultData}>
        <Text style={styles.resultValue}>Invalid artifact data</Text>
      </View>
    );
  }

  const artifactType = ARTIFACT_TYPES.find((t) => t.value === artifact.type);

  return (
    <View style={styles.artifactResult}>
      <View style={styles.artifactRow}>
        <Text style={styles.resultLabel}>ID:</Text>
        <Text style={styles.resultValue}>{artifact.id}</Text>
      </View>
      <View style={styles.artifactRow}>
        <Text style={styles.resultLabel}>Name:</Text>
        <Text style={styles.resultValue}>{artifact.name}</Text>
      </View>
      <View style={styles.artifactRow}>
        <Text style={styles.resultLabel}>Type:</Text>
        <Text style={styles.resultValue}>{artifactType?.label || artifact.type}</Text>
      </View>
      {artifact.material && (
        <View style={styles.artifactRow}>
          <Text style={styles.resultLabel}>Material:</Text>
          <Text style={styles.resultValue}>{artifact.material}</Text>
        </View>
      )}
      {artifact.estimatedAge && (
        <View style={styles.artifactRow}>
          <Text style={styles.resultLabel}>Age:</Text>
          <Text style={styles.resultValue}>{artifact.estimatedAge}</Text>
        </View>
      )}
      {artifact.provenance?.location?.site && (
        <View style={styles.artifactRow}>
          <Text style={styles.resultLabel}>Site:</Text>
          <Text style={styles.resultValue}>{artifact.provenance.location.site}</Text>
        </View>
      )}
      {artifact.provenance?.discoveredBy && (
        <View style={styles.artifactRow}>
          <Text style={styles.resultLabel}>Discovered By:</Text>
          <Text style={styles.resultValue}>{artifact.provenance.discoveredBy}</Text>
        </View>
      )}
      {artifact.notes && (
        <View style={styles.artifactRow}>
          <Text style={styles.resultLabel}>Notes:</Text>
          <Text style={styles.resultValue}>{artifact.notes}</Text>
        </View>
      )}
      <View style={styles.provenanceTag}>
        <MaterialIcons name="verified" size={16} color="#4CAF50" />
        <Text style={styles.provenanceTagText}>Provenance Verified</Text>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [scannedData, setScannedData] = useState('');
  const [isArtifact, setIsArtifact] = useState(false);
  const [quantumQR, setQuantumQR] = useState<QuantumQRCode | null>(null);
  const [unlockedLayers, setUnlockedLayers] = useState<UnlockedLayer[]>([]);
  const [showPINInput, setShowPINInput] = useState(false);
  const [systemPIN, setSystemPIN] = useState<string>();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [quantumDetected, setQuantumDetected] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [developerMode, setDeveloperMode] = useState(false);
  const [biometricAvailable] = useState(false); // Biometric disabled - optional dependency
  const insets = useSafeAreaInsets();
  
  // Animations
  const pulseAnim = useState(new Animated.Value(1))[0];
  const toastAnim = useState(new Animated.Value(0))[0];
  const reticleRotate = useState(new Animated.Value(0))[0];

  useEffect(() => {
    requestPermission();
    loadPIN();
    // checkBiometric(); // Disabled - optional dependency
    startReticleAnimation();
  }, []);

  useEffect(() => {
    if (quantumDetected) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [quantumDetected]);

  const startReticleAnimation = () => {
    Animated.loop(
      Animated.timing(reticleRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastVisible(false));
  };

  const loadPIN = async () => {
    const pinConfig = await storageService.getPINConfig();
    if (pinConfig.enabled) {
      setSystemPIN(pinConfig.pin);
    }
  };

  // Biometric authentication disabled - optional dependency
  // const checkBiometric = async () => {
  //   try {
  //     const compatible = await LocalAuthentication.hasHardwareAsync();
  //     const enrolled = await LocalAuthentication.isEnrolledAsync();
  //     setBiometricAvailable(compatible && enrolled);
  //   } catch (error) {
  //     console.error('Biometric check error:', error);
  //   }
  // };

  const handleBiometricUnlock = async () => {
    // Biometric disabled - show PIN input instead
    Alert.alert('Use PIN', 'Biometric authentication is not available. Please use PIN to unlock.');
    setShowPINInput(true);
  };

  const handleToggleDeveloperMode = () => {
    if (!developerMode) {
      Alert.alert(
        'Enable Developer Mode?',
        'This will reveal hidden layers containing advanced metadata and crash logs.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'destructive',
            onPress: () => {
              setDeveloperMode(true);
              showToast('Developer Mode enabled');
            },
          },
        ]
      );
    } else {
      setDeveloperMode(false);
      showToast('Developer Mode disabled');
    }
  };

  const reloadQuantumLayers = async () => {
    if (quantumQR && systemPIN) {
      const unlocked = await quantumQRService.unlockAllLayers(quantumQR, systemPIN, developerMode);
      setUnlockedLayers(unlocked);
    }
  };

  const requestPermission = async () => {
    try {
      setRequesting(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device Settings to use the scanner.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    } finally {
      setRequesting(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    try {
      // Detect Quantum QR before full scan
      if (data.startsWith(QUANTUM_QR_PREFIX)) {
        setQuantumDetected(true);
        showToast('Quantum QR detected — multiple layers available');
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      setScanned(true);
      setScannedData(data);
      
      // Check if it's a Quantum QR code
      if (data.startsWith(QUANTUM_QR_PREFIX)) {
        const decodedQuantum = quantumQRService.decodeQuantumQR(data);
        if (decodedQuantum) {
          setQuantumQR(decodedQuantum);
          // Auto-unlock public layers
          const unlocked = await quantumQRService.unlockAllLayers(decodedQuantum, '', false);
          setUnlockedLayers(unlocked);
          return;
        }
      }
      
      // Check if it's an artifact QR code
      if (data.startsWith('CODEVAULT_ARTIFACT:')) {
        const artifactData = artifactService.decodeArtifactQR(data);
        if (artifactData) {
          setIsArtifact(true);
          return;
        }
      }
      
      const parsedData = qrService.parseQRData(data);
      setQrData(parsedData);
      setIsArtifact(false);
      setQuantumQR(null);
    } catch (error) {
      console.error('Error parsing QR data:', error);
      Alert.alert('Error', 'Failed to parse QR code data');
      setScanned(false);
    }
  };

  const handleAction = async () => {
    if (!qrData) return;

    try {
      switch (qrData.type) {
        case 'url':
        case 'email':
        case 'sms':
        case 'location':
          await Linking.openURL(qrData.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Unable to open this link');
    }
  };

  const handleClose = () => {
    setQrData(null);
    setScannedData('');
    setIsArtifact(false);
    setQuantumQR(null);
    setUnlockedLayers([]);
    setQuantumDetected(false);
    setDeveloperMode(false);
    setTimeout(() => {
      setScanned(false);
    }, 500);
  };

  const handleUnlockQuantum = async (pin: string) => {
    if (!quantumQR || !systemPIN) return;

    if (pin !== systemPIN) {
      Alert.alert('Error', 'Invalid PIN');
      return;
    }

    const unlocked = await quantumQRService.unlockAllLayers(quantumQR, pin, false);
    setUnlockedLayers(unlocked);
    setShowPINInput(false);
    Alert.alert('Success', 'Private layers unlocked');
  };

  if (hasPermission === null || requesting) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="camera" size={64} color="#00D9FF" />
        <Text style={styles.permissionTitle}>Requesting Camera Access</Text>
        <Text style={styles.message}>Please wait...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="no-photography" size={64} color="#FF4444" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.message}>
          To scan QR codes and artifacts, Code Vault needs access to your camera.
        </Text>
        <Text style={styles.instructionText}>
          When you tap "Grant Permission", your device will show a permission dialog. 
          Please tap "Allow" or "OK" to enable scanning.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          disabled={requesting}
        >
          <MaterialIcons name="camera" size={20} color="#000000" />
          <Text style={styles.permissionButtonText}>
            {requesting ? 'Requesting...' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          If you previously denied permission, you may need to enable it in your device Settings:
          {'\n\n'}iOS: Settings → Code Vault → Camera → Enable
          {'\n'}Android: Settings → Apps → Code Vault → Permissions → Camera → Allow
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <MaterialIcons name="qr-code-scanner" size={32} color="#00D9FF" />
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            {/* Targeting Reticle */}
            <Animated.View 
              style={[
                styles.reticleOuter,
                {
                  transform: [
                    {
                      rotate: reticleRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.reticleCircle} />
            </Animated.View>
            
            {/* Scan Frame */}
            <Animated.View 
              style={[
                styles.scanFrame,
                quantumDetected && {
                  transform: [{ scale: pulseAnim }],
                  borderColor: '#9C27B0',
                },
              ]}
            >
              {/* Corner Indicators */}
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              
              {/* Quantum Indicator */}
              {quantumDetected && (
                <View style={styles.quantumIndicator}>
                  <MaterialIcons name="layers" size={24} color="#9C27B0" />
                  <View style={styles.layerDots}>
                    <View style={[styles.layerDot, { backgroundColor: '#00D9FF' }]} />
                    <View style={[styles.layerDot, { backgroundColor: '#FFD700' }]} />
                    <View style={[styles.layerDot, { backgroundColor: '#FF4444' }]} />
                  </View>
                </View>
              )}
            </Animated.View>
            
            {/* Scanning Line */}
            {!scanned && (
              <View style={styles.scanLine} />
            )}
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <MaterialIcons
            name={flashEnabled ? 'flash-on' : 'flash-off'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <MaterialIcons name="security" size={20} color="#00D9FF" />
        <Text style={styles.infoText}>Offline • Zero Tracking</Text>
      </View>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name="layers" size={20} color="#9C27B0" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <Modal visible={scanned} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <MaterialIcons 
                  name={quantumQR ? "layers" : isArtifact ? "inventory" : "check-circle"} 
                  size={32} 
                  color={quantumQR ? "#9C27B0" : isArtifact ? "#FFD700" : "#4CAF50"} 
                />
                <Text style={styles.modalTitle}>
                  {quantumQR ? 'Quantum QR Scanned' : isArtifact ? 'Artifact Scanned' : qrData?.encrypted ? 'Encrypted QR Code' : 'QR Code Scanned'}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {quantumQR ? (
                <QuantumResultView
                  quantumQR={quantumQR}
                  unlockedLayers={unlockedLayers}
                  onUnlock={() => setShowPINInput(true)}
                  onUnlockBiometric={handleBiometricUnlock}
                  developerMode={developerMode}
                  onToggleDeveloperMode={handleToggleDeveloperMode}
                  onReload={reloadQuantumLayers}
                />
              ) : isArtifact ? (
                <ArtifactResultView data={scannedData} />
              ) : (
                <>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{qrData?.type.toUpperCase()}</Text>
                  </View>

                  <View style={styles.dataContainer}>
                    <Text style={styles.dataText} numberOfLines={10}>
                      {qrData?.data}
                    </Text>
                  </View>

                  {!qrData?.encrypted && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
                      <Text style={styles.actionButtonText}>Open</Text>
                      <MaterialIcons name="launch" size={20} color="#000000" />
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showPINInput} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.pinTitle}>Enter PIN</Text>
            <Text style={styles.pinMessage}>Enter your Code Vault PIN to unlock private layers</Text>
            <PINInput
              length={4}
              onComplete={handleUnlockQuantum}
              onCancel={() => setShowPINInput(false)}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: '#00D9FF33',
    borderStyle: 'dashed',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#00D9FF',
    borderRadius: 20,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#00D9FF',
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 30,
    height: 30,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: '#00D9FF',
    borderTopRightRadius: 20,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -3,
    left: -3,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#00D9FF',
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 30,
    height: 30,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#00D9FF',
    borderBottomRightRadius: 20,
  },
  quantumIndicator: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#0F0F1Ecc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    gap: 6,
  },
  layerDots: {
    flexDirection: 'row',
    gap: 4,
  },
  layerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: '#00D9FF',
    top: '50%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    backgroundColor: '#1A1A2E',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  message: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
  },
  instructionText: {
    color: '#00D9FF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  helpText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: '#00D9FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00D9FF33',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00D9FF22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  typeBadgeText: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '700',
  },
  dataContainer: {
    backgroundColor: '#0F0F1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 200,
  },
  dataText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  doneButton: {
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultData: {
    marginTop: 20,
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
  },
  artifactResult: {
    marginTop: 20,
    marginBottom: 24,
  },
  artifactRow: {
    marginBottom: 12,
  },
  provenanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  provenanceTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  quantumResult: {
    marginTop: 20,
    marginBottom: 24,
  },
  developerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#66666633',
  },
  developerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  developerTextActive: {
    color: '#FF4444',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF444422',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF4444',
  },
  layerCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  layerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  layerCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sovereignSeal: {
    marginRight: 8,
  },
  layerDescription: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  layerDataContainer: {
    backgroundColor: '#0F0F1E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  layerDataText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  layerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  layerActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF22',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  layerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00D9FF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70022',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  pinUnlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A3E',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  pinUnlockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  quantumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quantumStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  layerLocked: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  layerLockedText: {
    fontSize: 13,
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
  },
  pinTitle: {
    fontSize: 20,
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
  toast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#9C27B0',
    gap: 8,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
