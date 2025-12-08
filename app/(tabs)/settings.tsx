import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePremium } from '@/hooks/usePremium';
import { usePIN } from '@/hooks/usePIN';
import { PINInput } from '@/components/PINInput';

export default function SettingsScreen() {
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [showPINVerify, setShowPINVerify] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { isPremium, generationCount, upgradeToPremium } = usePremium();
  const { enabled: pinEnabled, setPIN, disablePIN } = usePIN();
  const insets = useSafeAreaInsets();

  const handleUpgrade = () => {
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = async () => {
    setShowUpgradeDialog(false);
    const success = await upgradeToPremium();
    if (success) {
      setShowSuccessDialog(true);
    }
  };

  const handlePINComplete = async (pin: string) => {
    const success = await setPIN(pin);
    setShowPINSetup(false);
    if (success) {
      Alert.alert('Success', 'PIN protection enabled');
    }
  };

  const handleDisablePIN = () => {
    setShowPINVerify(true);
  };

  const handlePINVerified = async (pin: string) => {
    const success = await disablePIN();
    setShowPINVerify(false);
    if (success) {
      Alert.alert('Success', 'PIN protection disabled');
    } else {
      Alert.alert('Error', 'Incorrect PIN');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <MaterialIcons name="settings" size={32} color="#00D9FF" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Status</Text>
          {isPremium ? (
            <View style={styles.premiumActive}>
              <MaterialIcons name="verified" size={24} color="#00D9FF" />
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Premium Active</Text>
                <Text style={styles.premiumSubtitle}>Unlimited generations</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Generations Used</Text>
                <Text style={styles.statsValue}>{generationCount} / 10</Text>
              </View>
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                <MaterialIcons name="diamond" size={24} color="#000000" />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium - $4.99</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={pinEnabled ? handleDisablePIN : () => setShowPINSetup(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name={pinEnabled ? 'lock' : 'lock-open'}
                  size={24}
                  color="#00D9FF"
                />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>PIN Protection</Text>
                  <Text style={styles.settingSubtitle}>
                    {pinEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <MaterialIcons name="security" size={48} color="#00D9FF" />
            <Text style={styles.aboutTitle}>Code Vault</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Privacy-first QR code scanner and generator.{'\n'}
              Completely offline. Zero tracking.
            </Text>
          </View>
        </View>

                <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <TouchableOpacity 
            style={styles.privacyLink}
            onPress={() => router.push('/privacy')}
          >
            <View style={styles.privacyLinkLeft}>
              <MaterialIcons name="privacy-tip" size={24} color="#00D9FF" />
              <View style={styles.privacyLinkInfo}>
                <Text style={styles.privacyLinkTitle}>Privacy Policy</Text>
                <Text style={styles.privacyLinkSubtitle}>Read our full privacy commitment</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
          
          <View style={styles.privacyItem}>
            <MaterialIcons name="cloud-off" size={20} color="#00D9FF" />
            <Text style={styles.privacyText}>No cloud sync</Text>
          </View>
          <View style={styles.privacyItem}>
            <MaterialIcons name="history-toggle-off" size={20} color="#00D9FF" />
            <Text style={styles.privacyText}>No scan history</Text>
          </View>
          <View style={styles.privacyItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.privacyText}>No data tracking</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showPINSetup} animationType="slide">
        <PINInput
          mode="set"
          onComplete={handlePINComplete}
          onCancel={() => setShowPINSetup(false)}
        />
      </Modal>

      <Modal visible={showPINVerify} animationType="slide">
        <PINInput
          mode="verify"
          title="Enter PIN to Disable"
          onComplete={handlePINVerified}
          onCancel={() => setShowPINVerify(false)}
        />
      </Modal>

      {/* Upgrade Confirmation Dialog */}
      <Modal visible={showUpgradeDialog} animationType="fade" transparent>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <MaterialIcons name="diamond" size={48} color="#00D9FF" />
            <Text style={styles.dialogTitle}>Upgrade to Premium</Text>
            <Text style={styles.dialogMessage}>
              This would normally process a $4.99 payment. For this demo, premium access will be activated immediately.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogButtonCancel}
                onPress={() => setShowUpgradeDialog(false)}
              >
                <Text style={styles.dialogButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogButtonConfirm}
                onPress={confirmUpgrade}
              >
                <Text style={styles.dialogButtonConfirmText}>Activate Premium</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Dialog */}
      <Modal visible={showSuccessDialog} animationType="fade" transparent>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.dialogTitle}>Success!</Text>
            <Text style={styles.dialogMessage}>
              Premium features activated! You now have unlimited QR code generation and access to all premium features.
            </Text>
            <TouchableOpacity
              style={[styles.dialogButtonConfirm, { width: '100%' }]}
              onPress={() => setShowSuccessDialog(false)}
            >
              <Text style={styles.dialogButtonConfirmText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  premiumActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  premiumInfo: {
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#00D9FF',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  statsLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00D9FF',
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
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  aboutCard: {
    backgroundColor: '#1A1A2E',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#00D9FF',
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  privacyLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyLinkInfo: {
    marginLeft: 16,
    flex: 1,
  },
  privacyLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyLinkSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D9FF',
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogButtonCancel: {
    flex: 1,
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666666',
  },
  dialogButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dialogButtonConfirm: {
    flex: 1,
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dialogButtonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});