import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePremium } from '@/hooks/usePremium';

interface PremiumCardProps {
  onUpgrade: () => void;
}

export function PremiumCard({ onUpgrade }: PremiumCardProps) {
  const { isPremium, remainingGenerations } = usePremium();

  if (isPremium) {
    return (
      <View style={styles.premiumBadge}>
        <MaterialIcons name="verified" size={20} color="#00D9FF" />
        <Text style={styles.premiumBadgeText}>Premium Active</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="diamond" size={32} color="#00D9FF" />
        <Text style={styles.title}>Upgrade to Premium</Text>
      </View>

      <View style={styles.limitInfo}>
        <Text style={styles.limitText}>
          {remainingGenerations} / {10} free generations remaining
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureItem icon="all-inclusive" text="Unlimited QR Generation" />
        <FeatureItem icon="lock" text="4-Digit PIN Protection" />
        <FeatureItem icon="shield" text="Encrypted Sharing" />
        <FeatureItem icon="payment" text="One-Time Payment: $4.99" />
      </View>

      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialIcons name={icon} size={20} color="#00D9FF" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  limitInfo: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  limitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  features: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#CCCCCC',
    fontSize: 15,
    marginLeft: 12,
  },
  upgradeButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D9FF22',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  premiumBadgeText: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});