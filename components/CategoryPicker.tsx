import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { QRCategory } from '@/types/qr';

interface CategoryPickerProps {
  categories: QRCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function CategoryPicker({
  categories,
  selectedCategory,
  onSelectCategory,
  isPremium,
  onUpgrade,
}: CategoryPickerProps) {
  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <MaterialIcons name="lock" size={24} color="#FFD700" />
        <Text style={styles.lockedText}>Categorize your QR codes</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <MaterialIcons name="star" size={16} color="#000000" />
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.category,
                  isSelected && styles.selectedCategory,
                  { borderColor: isSelected ? category.color : 'transparent' },
                ]}
                onPress={() => onSelectCategory(category.id)}
              >
                <MaterialIcons
                  name={category.icon as any}
                  size={24}
                  color={isSelected ? category.color : '#CCCCCC'}
                />
                <Text
                  style={[
                    styles.categoryName,
                    { color: isSelected ? category.color : '#CCCCCC' },
                  ]}
                >
                  {category.name}
                </Text>
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
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  category: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#0F0F1E',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
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
