import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { QuantumLayerConfig } from '@/types/quantumQR';
import { LAYER_TYPES } from '@/types/quantumQR';

interface QuantumQRGeneratorProps {
  isPremium: boolean;
  onGenerate: (name: string, layers: QuantumLayerConfig[]) => void;
  onClose: () => void;
  onUpgrade: () => void;
}

export function QuantumQRGenerator({
  isPremium,
  onGenerate,
  onClose,
  onUpgrade,
}: QuantumQRGeneratorProps) {
  const [qrName, setQrName] = useState('');
  const [layers, setLayers] = useState<QuantumLayerConfig[]>([
    { type: 'public', name: 'Public Info', data: '' },
  ]);

  const addLayer = (type: 'public' | 'private' | 'hidden') => {
    if (!isPremium && (type === 'private' || type === 'hidden')) {
      onUpgrade();
      return;
    }

    const newLayer: QuantumLayerConfig = {
      type,
      name: `${LAYER_TYPES.find((t) => t.type === type)?.label} ${layers.length + 1}`,
      data: '',
    };

    setLayers([...layers, newLayer]);
  };

  const updateLayer = (index: number, field: keyof QuantumLayerConfig, value: string) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], [field]: value };
    setLayers(updated);
  };

  const removeLayer = (index: number) => {
    if (layers.length === 1) {
      Alert.alert('Error', 'Quantum QR must have at least one layer');
      return;
    }
    setLayers(layers.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!qrName.trim()) {
      Alert.alert('Error', 'Please enter a name for this Quantum QR');
      return;
    }

    if (layers.some((layer) => !layer.data.trim())) {
      Alert.alert('Error', 'All layers must contain data');
      return;
    }

    onGenerate(qrName, layers);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="layers" size={28} color="#00D9FF" />
          <Text style={styles.title}>Quantum QR</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Create a multi-layer QR code with public, private, and hidden compartments. Each layer
          can be unlocked with different authentication levels.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Quantum QR name *"
        placeholderTextColor="#666666"
        value={qrName}
        onChangeText={setQrName}
      />

      <View style={styles.layersSection}>
        <Text style={styles.sectionTitle}>Layers ({layers.length})</Text>

        {layers.map((layer, index) => {
          const layerType = LAYER_TYPES.find((t) => t.type === layer.type);

          return (
            <View key={index} style={styles.layerCard}>
              <View style={styles.layerHeader}>
                <View style={styles.layerInfo}>
                  <MaterialIcons
                    name={layerType?.icon as any}
                    size={20}
                    color={layerType?.color}
                  />
                  <Text style={styles.layerType}>{layerType?.label}</Text>
                </View>
                {layers.length > 1 && (
                  <TouchableOpacity onPress={() => removeLayer(index)}>
                    <MaterialIcons name="delete" size={20} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.layerDescription}>{layerType?.description}</Text>

              <TextInput
                style={styles.layerInput}
                placeholder="Layer name"
                placeholderTextColor="#666666"
                value={layer.name}
                onChangeText={(text) => updateLayer(index, 'name', text)}
              />

              <TextInput
                style={[styles.layerInput, styles.dataInput]}
                placeholder="Layer data"
                placeholderTextColor="#666666"
                value={layer.data}
                onChangeText={(text) => updateLayer(index, 'data', text)}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.layerInput}
                placeholder="Description (optional)"
                placeholderTextColor="#666666"
                value={layer.description || ''}
                onChangeText={(text) => updateLayer(index, 'description', text)}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.addLayerSection}>
        <Text style={styles.addLayerTitle}>Add Layer</Text>
        <View style={styles.layerButtons}>
          {LAYER_TYPES.map((layerType) => (
            <TouchableOpacity
              key={layerType.type}
              style={[
                styles.addLayerButton,
                { borderColor: layerType.color + '33', backgroundColor: layerType.color + '11' },
              ]}
              onPress={() => addLayer(layerType.type)}
            >
              <MaterialIcons name={layerType.icon as any} size={20} color={layerType.color} />
              <Text style={[styles.addLayerText, { color: layerType.color }]}>
                {layerType.label}
              </Text>
              {!isPremium && layerType.requiresAuth && (
                <MaterialIcons name="stars" size={14} color="#FFD700" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!isPremium && (
        <View style={styles.premiumNotice}>
          <MaterialIcons name="stars" size={20} color="#FFD700" />
          <Text style={styles.premiumText}>
            Private and Hidden layers require Premium
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
        <MaterialIcons name="qr-code" size={20} color="#000000" />
        <Text style={styles.generateButtonText}>Generate Quantum QR</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  layersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9FF',
    marginBottom: 12,
  },
  layerCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  layerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layerType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  layerDescription: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  layerInput: {
    backgroundColor: '#0F0F1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00D9FF22',
  },
  dataInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addLayerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addLayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  layerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addLayerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  addLayerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  premiumNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70022',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF',
    marginHorizontal: 20,
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
