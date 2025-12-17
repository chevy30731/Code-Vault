import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePremium } from '@/hooks/usePremium';

interface PremiumCardProps {
  onUpgrade?: () => void;
}

export function PremiumCard({ onUpgrade }: PremiumCardProps) {
  const { isPremium, remainingGenerations, upgradeToPremium, purchasing } = usePremium();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpgradeRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirmUpgrade = async () => {
    setShowConfirm(false);
    setErrorMessage('');

    const result = await upgradeToPremium();

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage(result.error || 'Purchase failed');
      setTimeout(() => setErrorMessage(''), 5000);
    }

    onUpgrade?.();
  };

  // Don't show card if already premium
  if (isPremium) {
    return null;
  }

  return (
    <>
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
          <FeatureItem icon="layers" text="Multi-Layer Quantum QR" />
          <FeatureItem icon="payment" text="One-Time Payment: $4.99" />
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={20} color="#FFFFFF" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.upgradeButton, purchasing && styles.upgradeButtonDisabled]}
          onPress={handleUpgradeRequest}
          disabled={purchasing}
        >
          {purchasing ? (
            <>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.upgradeButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="diamond" size={48} color="#00D9FF" />
            <Text style={styles.modalTitle}>Upgrade to Premium?</Text>
            <Text style={styles.modalMessage}>
              You'll be charged $4.99 (one-time payment) through {Platform.OS === 'ios' ? 'Apple App Store' : 'Google Play Store'}.
            </Text>

            <View style={styles.modalBenefits}>
              <Text style={styles.benefitItem}>✓ Unlimited QR Generation</Text>
              <Text style={styles.benefitItem}>✓ PIN Protection</Text>
              <Text style={styles.benefitItem}>✓ Encrypted Sharing</Text>
              <Text style={styles.benefitItem}>✓ Multi-Layer Quantum QR</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonConfirm} 
                onPress={handleConfirmUpgrade}
              >
                <Text style={styles.modalButtonConfirmText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.modalTitle}>Premium Activated!</Text>
            <Text style={styles.modalMessage}>
              You now have unlimited access to all premium features.
            </Text>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, { width: '100%' }]}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalButtonConfirmText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  errorBanner: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalBenefits: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    fontSize: 15,
    color: '#00D9FF',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#333344',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
