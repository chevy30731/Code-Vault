import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QR_COLOR_PRESETS } from '@/types/qr';

interface ColorPickerProps {
  selectedForeground: string;
  selectedBackground: string;
  onSelectColor: (foreground: string, background: string) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function ColorPicker({
  selectedForeground,
  selectedBackground,
  onSelectColor,
  isPremium,
  onUpgrade,
}: ColorPickerProps) {
  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <MaterialIcons name="lock" size={24} color="#FFD700" />
        <Text style={styles.lockedText}>Custom colors</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <MaterialIcons name="star" size={16} color="#000000" />
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Colors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.presetsContainer}>
          {QR_COLOR_PRESETS.map((preset) => {
            const isSelected =
              preset.foreground === selectedForeground &&
              preset.background === selectedBackground;

            return (
              <TouchableOpacity
                key={preset.name}
                style={[styles.preset, isSelected && styles.selectedPreset]}
                onPress={() => onSelectColor(preset.foreground, preset.background)}
              >
                <View
                  style={[
                    styles.colorSample,
                    { backgroundColor: preset.background },
                  ]}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: preset.foreground },
                    ]}
                  />
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
                {isSelected && (
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#00D9FF"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  presetsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  preset: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedPreset: {
    borderColor: '#00D9FF',
  },
  colorSample: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  presetName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lockedContainer: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  lockedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});
