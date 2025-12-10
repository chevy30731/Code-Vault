import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ScanProfile } from '@/types/scanLog';
import { SCAN_PROFILES } from '@/types/scanLog';

interface ScanProfileSelectorProps {
  selectedProfile: ScanProfile;
  onSelect: (profile: ScanProfile) => void;
}

export function ScanProfileSelector({ selectedProfile, onSelect }: ScanProfileSelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {SCAN_PROFILES.map((profile) => {
        const isSelected = selectedProfile === profile.id;
        
        return (
          <TouchableOpacity
            key={profile.id}
            style={[
              styles.profileCard,
              isSelected && styles.profileCardActive,
              { borderColor: profile.color + '33' },
              isSelected && { borderColor: profile.color, backgroundColor: profile.color + '22' },
            ]}
            onPress={() => onSelect(profile.id)}
          >
            <MaterialIcons 
              name={profile.icon as any} 
              size={24} 
              color={isSelected ? profile.color : '#666666'} 
            />
            <Text style={[
              styles.profileName,
              isSelected && { color: profile.color },
            ]}>
              {profile.name}
            </Text>
            <Text style={styles.profileDescription}>{profile.description}</Text>
            
            {/* Feature Badges */}
            <View style={styles.features}>
              {profile.autoCopy && (
                <View style={[styles.featureBadge, { backgroundColor: profile.color + '22' }]}>
                  <MaterialIcons name="content-copy" size={10} color={profile.color} />
                </View>
              )}
              {profile.autoOpen && (
                <View style={[styles.featureBadge, { backgroundColor: profile.color + '22' }]}>
                  <MaterialIcons name="open-in-new" size={10} color={profile.color} />
                </View>
              )}
              {profile.autoArchive && (
                <View style={[styles.featureBadge, { backgroundColor: profile.color + '22' }]}>
                  <MaterialIcons name="archive" size={10} color={profile.color} />
                </View>
              )}
              {profile.addGPS && (
                <View style={[styles.featureBadge, { backgroundColor: profile.color + '22' }]}>
                  <MaterialIcons name="location-on" size={10} color={profile.color} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 140,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  profileCard: {
    width: 140,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  profileCardActive: {
    transform: [{ scale: 1.05 }],
  },
  profileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  profileDescription: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  features: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
