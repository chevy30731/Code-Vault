import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { artifactService } from '@/services/artifact';
import { imageCompressionService } from '@/services/imageCompression';
import { storageService } from '@/services/storage';
import type { ArtifactMetadata, ArtifactType } from '@/types/artifact';
import { ARTIFACT_TYPES, OWNERSHIP_TYPES, ACQUISITION_METHODS, CONDITION_LEVELS, AUTHENTICITY_LEVELS } from '@/types/artifact';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ArtifactType>('stone-tool');
  const [material, setMaterial] = useState('');
  const [estimatedAge, setEstimatedAge] = useState('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'fragmentary'>('good');
  const [site, setSite] = useState('');
  const [discoveredBy, setDiscoveredBy] = useState('');
  const [description, setDescription] = useState('');
  const [ownership, setOwnership] = useState<'personal' | 'institutional' | 'public' | 'restricted'>('personal');
  const [acquisitionMethod, setAcquisitionMethod] = useState<'excavation' | 'purchase' | 'donation' | 'inheritance' | 'found'>('found');
  const [authenticity, setAuthenticity] = useState<'verified' | 'probable' | 'uncertain' | 'replica'>('probable');
  const [notes, setNotes] = useState('');

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="photo-camera" size={64} color="#666666" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Code Vault needs camera access to photograph artifacts for cataloging and provenance documentation.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an artifact name');
      return;
    }

    try {
      // Get current location
      let location;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }

      // Compress image
      let compressedImage;
      if (capturedImage) {
        compressedImage = await imageCompressionService.compressImage(capturedImage, 0.6);
      }

      // Create artifact
      const artifact: Partial<ArtifactMetadata> = {
        name,
        type,
        material: material || undefined,
        estimatedAge: estimatedAge || undefined,
        condition,
        provenance: {
          location: location ? { ...location, site: site || undefined } : { site: site || undefined },
          discoveryDate: Date.now(),
          discoveredBy: discoveredBy || undefined,
        },
        appraisal: {
          description: description || undefined,
          authenticity,
        },
        legal: {
          ownership,
          acquisitionMethod,
        },
        media: {
          primaryImage: compressedImage,
          imageCount: compressedImage ? 1 : 0,
        },
        notes: notes || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Generate ID
      const id = await artifactService.generateArtifactId(artifact);
      const fullArtifact = { ...artifact, id } as ArtifactMetadata;

      // Save
      await storageService.saveArtifact(fullArtifact);

      Alert.alert(
        'Success',
        `Artifact ${id} cataloged successfully!`,
        [
          {
            text: 'View Archive',
            onPress: () => router.push('/(tabs)/archive'),
          },
          {
            text: 'Capture Another',
            onPress: () => {
              setCapturedImage(null);
              setShowForm(false);
              resetForm();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving artifact:', error);
      Alert.alert('Error', 'Failed to save artifact');
    }
  };

  const resetForm = () => {
    setName('');
    setMaterial('');
    setEstimatedAge('');
    setSite('');
    setDiscoveredBy('');
    setDescription('');
    setNotes('');
  };

  if (showForm && capturedImage) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top }]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Artifact Metadata</Text>
            <TouchableOpacity onPress={handleRetake}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Image source={{ uri: capturedImage }} style={styles.capturedImagePreview} />

          <Text style={styles.sectionTitle}>Basic Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Artifact name *"
            placeholderTextColor="#666666"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            <View style={styles.typeRow}>
              {ARTIFACT_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.typeChip, type === item.value && styles.typeChipActive]}
                  onPress={() => setType(item.value)}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={16}
                    color={type === item.value ? '#000000' : '#00D9FF'}
                  />
                  <Text style={[styles.typeChipText, type === item.value && styles.typeChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Material (e.g., flint, ceramic, bronze)"
            placeholderTextColor="#666666"
            value={material}
            onChangeText={setMaterial}
          />

          <TextInput
            style={styles.input}
            placeholder="Estimated age (e.g., 5000 BCE, Roman period)"
            placeholderTextColor="#666666"
            value={estimatedAge}
            onChangeText={setEstimatedAge}
          />

          <Text style={styles.label}>Condition</Text>
          <View style={styles.conditionRow}>
            {CONDITION_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.conditionChip,
                  condition === item.value && { backgroundColor: item.color },
                ]}
                onPress={() => setCondition(item.value)}
              >
                <Text style={styles.conditionChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Provenance</Text>

          <TextInput
            style={styles.input}
            placeholder="Discovery site/location"
            placeholderTextColor="#666666"
            value={site}
            onChangeText={setSite}
          />

          <TextInput
            style={styles.input}
            placeholder="Discovered by"
            placeholderTextColor="#666666"
            value={discoveredBy}
            onChangeText={setDiscoveredBy}
          />

          <Text style={styles.sectionTitle}>Appraisal</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description and significance"
            placeholderTextColor="#666666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Authenticity</Text>
          <View style={styles.authenticityRow}>
            {AUTHENTICITY_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.authenticityChip,
                  authenticity === item.value && styles.authenticityChipActive,
                ]}
                onPress={() => setAuthenticity(item.value)}
              >
                <Text
                  style={[
                    styles.authenticityChipText,
                    authenticity === item.value && styles.authenticityChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Legal Compliance</Text>

          <Text style={styles.label}>Ownership</Text>
          <View style={styles.ownershipRow}>
            {OWNERSHIP_TYPES.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.ownershipChip,
                  ownership === item.value && styles.ownershipChipActive,
                ]}
                onPress={() => setOwnership(item.value)}
              >
                <Text
                  style={[
                    styles.ownershipChipText,
                    ownership === item.value && styles.ownershipChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Acquisition Method</Text>
          <View style={styles.acquisitionRow}>
            {ACQUISITION_METHODS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.acquisitionChip,
                  acquisitionMethod === item.value && styles.acquisitionChipActive,
                ]}
                onPress={() => setAcquisitionMethod(item.value)}
              >
                <Text
                  style={[
                    styles.acquisitionChipText,
                    acquisitionMethod === item.value && styles.acquisitionChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Additional Notes</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes, observations, or context"
            placeholderTextColor="#666666"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialIcons name="save" size={20} color="#000000" />
            <Text style={styles.saveButtonText}>Save to Archive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        <View style={styles.captureActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.useButton} onPress={() => setShowForm(true)}>
            <MaterialIcons name="check" size={24} color="#000000" />
            <Text style={styles.useButtonText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={[styles.cameraHeader, { paddingTop: insets.top + 16 }]}>
          <MaterialIcons name="photo-camera" size={32} color="#00D9FF" />
          <Text style={styles.cameraTitle}>Capture Artifact</Text>
        </View>

        <View style={styles.cameraGuide}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Center artifact in frame</Text>
        </View>

        <View style={styles.cameraFooter}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#00D9FF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  guideText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00D9FF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00D9FF',
  },
  capturedImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  captureActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D9FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  formScrollView: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 24,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  capturedImagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9FF',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeScroll: {
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
    gap: 4,
  },
  typeChipActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeChipTextActive: {
    color: '#000000',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  conditionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  conditionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authenticityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  authenticityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  authenticityChipActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  authenticityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authenticityChipTextActive: {
    color: '#000000',
  },
  ownershipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  ownershipChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  ownershipChipActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  ownershipChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ownershipChipTextActive: {
    color: '#000000',
  },
  acquisitionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  acquisitionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  acquisitionChipActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  acquisitionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  acquisitionChipTextActive: {
    color: '#000000',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
