import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = [
  { label: 'Black', value: '#000000', bg: '#FFFFFF' },
  { label: 'Cyan', value: '#00D9FF', bg: '#000000' },
  { label: 'Gold', value: '#FFD700', bg: '#000000' },
  { label: 'Purple', value: '#9C27B0', bg: '#FFFFFF' },
  { label: 'Red', value: '#FF4444', bg: '#FFFFFF' },
  { label: 'Green', value: '#4CAF50', bg: '#FFFFFF' },
];

interface ColorPickerProps {
  selectedColor: string;
  selectedBackground: string;
  onSelectColor: (color: string) => void;
  onSelectBackground: (bg: string) => void;
}

export function ColorPicker({
  selectedColor,
  selectedBackground,
  onSelectColor,
  onSelectBackground,
}: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>QR Code Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorOption,
                { backgroundColor: color.value },
                selectedColor === color.value && styles.colorSelected,
              ]}
              onPress={() => onSelectColor(color.value)}
            >
              {selectedColor === color.value && (
                <MaterialIcons name="check" size={20} color={color.bg} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.label, styles.labelSpaced]}>Background Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorOption,
                { backgroundColor: color.value },
                selectedBackground === color.value && styles.colorSelected,
              ]}
              onPress={() => onSelectBackground(color.value)}
            >
              {selectedBackground === color.value && (
                <MaterialIcons name="check" size={20} color={color.bg} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9FF',
    marginBottom: 8,
    marginLeft: 4,
  },
  labelSpaced: {
    marginTop: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  colorSelected: {
    borderColor: '#00D9FF',
    borderWidth: 3,
  },
});
