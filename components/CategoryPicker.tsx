import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { QRCategory } from '@/types/qr';
import { QR_CATEGORIES } from '@/types/qr';

interface CategoryPickerProps {
  selected: QRCategory;
  onSelect: (category: QRCategory) => void;
  isPremium: boolean;
}

export function CategoryPicker({ selected, onSelect, isPremium }: CategoryPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QR_CATEGORIES.map((category) => {
        const isLocked = category.type === 'encrypted' && !isPremium;
        const isSelected = selected === category.type;

        return (
          <TouchableOpacity
            key={category.type}
            style={[
              styles.category,
              isSelected && styles.categorySelected,
              isLocked && styles.categoryLocked,
            ]}
            onPress={() => !isLocked && onSelect(category.type)}
            disabled={isLocked}
          >
            <View style={[styles.iconContainer, { backgroundColor: category.color + '22' }]}>
              <MaterialIcons 
                name={isLocked ? 'lock' : category.icon as any} 
                size={24} 
                color={isLocked ? '#666666' : category.color} 
              />
            </View>
            <Text style={[
              styles.label,
              isSelected && styles.labelSelected,
              isLocked && styles.labelLocked,
            ]}>
              {category.label}
            </Text>
            {isLocked && (
              <View style={styles.premiumBadge}>
                <MaterialIcons name="diamond" size={12} color="#FFD700" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  category: {
    alignItems: 'center',
    marginHorizontal: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  categorySelected: {
    borderColor: '#00D9FF',
    backgroundColor: '#00D9FF11',
  },
  categoryLocked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCCCCC',
    textAlign: 'center',
  },
  labelSelected: {
    color: '#00D9FF',
  },
  labelLocked: {
    color: '#666666',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
