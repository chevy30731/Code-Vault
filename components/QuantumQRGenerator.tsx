import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { LayerType, QuantumQRCode } from '@/types/quantumQR';
import { LAYER_TYPES } from '@/types/quantumQR';
import { quantumQRService } from '@/services/quantumQR';
import { storageService } from '@/services/storage';
import { PINInput } from './PINInput';

interface QuantumQRGeneratorProps {
  onComplete: (qr: QuantumQRCode) => void;
  onCancel: () => void;
  systemPIN?: string;
}

export function QuantumQRGenerator({ onComplete, onCancel, systemPIN }: QuantumQRGeneratorProps) {
  const [qrName, setQrName] = useState('');
  const [layers, setLayers] = useState<Array<{
    type: LayerType;
    name: string;
    data: string;
    description: string;
  }>>([]);
  const [currentLayer, setCurrentLayer] = useState<LayerType>('public');
  const [layerName, setLayerName] = useState('');
  const [layerData, setLayerData] = useState('');
  const [layerDescription, setLayerDescription] = useState('');
  const [showPINInput, setShowPINInput] = useState(false);
  const [generatingPIN, setGeneratingPIN] = useState('');

  const addLayer = () => {
    if (!layerName || !layerData) {
      Alert.alert('Error', 'Please fill in layer name and data');
      return;
    }

    setLayers([...layers, {
      type: currentLayer,
      name: layerName,
      data: layerData,
      description: layerDescription,
    }]);

    setLayerName('');
    setLayerData('');
    setLayerDescription('');
  };

  const removeLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index));
  };

  const handleGenerate = async (pin: string) => {
    if (!qrName) {
      Alert.alert('Error', 'Please enter a QR code name');
      return;
    }

    if (layers.length === 0) {
      Alert.alert('Error', 'Add at least one layer');
      return;
    }

    try {
      const qrLayers = await Promise.all(
        layers.map((layer) =>
          quantumQRService.createLayer(
            layer.type,
            layer.name,
            layer.data,
            pin,
            { description: layer.description }
          )
        )
      );

      const quantumQR: QuantumQRCode = {
        id: Date.now().toString(),
        name: qrName,
        layers: qrLayers,
        createdAt: Date.now(),
      };

      await storageService.addQuantumQR(quantumQR);
      onComplete(quantumQR);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate Quantum QR');
    }
  };

  const initiateGeneration = () => {
    const hasPrivateOrHidden = layers.some((l) => l.type !== 'public');
    
    if (hasPrivateOrHidden && !systemPIN) {
      Alert.alert('PIN Required', 'Please set up a PIN in Settings to create encrypted layers');
      return;
    }

    if (hasPrivateOrHidden) {
      setShowPINInput(true);
    } else {
      handleGenerate('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Create Quantum QR</Text>
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>QR Code Name</Text>
          <TextInput
            style={styles.input}
            value={qrName}
            onChangeText={setQrName}
            placeholder="Enter name"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Layer Type</Text>
          <View style={styles.layerTypes}>
            {LAYER_TYPES.map((type) => (
              <TouchableOpacity
                key={type.type}
                style={[
                  styles.layerType,
                  currentLayer === type.type && styles.layerTypeSelected,
                ]}
                onPress={() => setCurrentLayer(type.type)}
              >
                <MaterialIcons name={type.icon as any} size={20} color={type.color} />
                <Text style={[styles.layerTypeText, { color: type.color }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Layer Name</Text>
          <TextInput
            style={styles.input}
            value={layerName}
            onChangeText={setLayerName}
            placeholder="e.g., Contact Info"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Layer Data</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={layerData}
            onChangeText={setLayerData}
            placeholder="Enter data for this layer"
            placeholderTextColor="#666666"
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            value={layerDescription}
            onChangeText={setLayerDescription}
            placeholder="Layer description"
            placeholderTextColor="#666666"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addLayer}>
          <MaterialIcons name="add-circle" size={20} color="#000000" />
          <Text style={styles.addButtonText}>Add Layer</Text>
        </TouchableOpacity>

        {layers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Added Layers ({layers.length})</Text>
            {layers.map((layer, index) => {
              const typeInfo = LAYER_TYPES.find((t) => t.type === layer.type);
              return (
                <View key={index} style={styles.layerItem}>
                  <View style={styles.layerItemContent}>
                    <MaterialIcons
                      name={typeInfo?.icon as any}
                      size={20}
                      color={typeInfo?.color}
                    />
                    <View style={styles.layerItemText}>
                      <Text style={styles.layerItemName}>{layer.name}</Text>
                      <Text style={styles.layerItemType}>{typeInfo?.label}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeLayer(index)}>
                    <MaterialIcons name="delete" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={initiateGeneration}
          disabled={!qrName || layers.length === 0}
        >
          <MaterialIcons name="layers" size={20} color="#000000" />
          <Text style={styles.generateButtonText}>Generate Quantum QR</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPINInput} animationType="slide">
        <PINInput
          mode="verify"
          title="Enter PIN to Encrypt"
          onComplete={(pin) => {
            if (systemPIN && pin === systemPIN) {
              setShowPINInput(false);
              handleGenerate(pin);
            } else {
              Alert.alert('Error', 'Invalid PIN');
            }
          }}
          onCancel={() => setShowPINInput(false)}
        />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9FF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  layerTypes: {
    flexDirection: 'row',
    gap: 8,
  },
  layerType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layerTypeSelected: {
    borderColor: '#00D9FF',
  },
  layerTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  layerItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  layerItemText: {
    flex: 1,
  },
  layerItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  layerItemType: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
