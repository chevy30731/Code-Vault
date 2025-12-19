import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ScanProfile } from '@/types/scanLog';
import { SCAN_PROFILES } from '@/types/scanLog';

interface ScanProfileSelectorProps {
  selected: ScanProfile;
  onSelect: (profile: ScanProfile) => void;
}

export function ScanProfileSelector({ selected, onSelect }: ScanProfileSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Profile</Text>
      <View style={styles.profiles}>
        {SCAN_PROFILES.map((profile) => {
          const isSelected = selected === profile.type;
          
          return (
            <TouchableOpacity
              key={profile.type}
              style={[styles.profile, isSelected && styles.profileSelected]}
              onPress={() => onSelect(profile.type)}
            >
              <MaterialIcons 
                name={profile.icon as any} 
                size={28} 
                color={isSelected ? profile.color : '#666666'} 
              />
              <Text style={[
                styles.profileLabel,
                isSelected && { color: profile.color },
              ]}>
                {profile.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profile: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileSelected: {
    borderColor: '#00D9FF',
    backgroundColor: '#00D9FF11',
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginTop: 8,
  },
});
