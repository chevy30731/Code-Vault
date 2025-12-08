import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Privacy Commitment</Text>
          <Text style={styles.paragraph}>
            Code Vault is built with privacy as our foundation. We believe your data belongs to you,
            and you alone. This policy explains exactly what data we do and don't collect, how we
            handle it, and your rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data We DON'T Collect</Text>
          <View style={styles.listItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No scan history or QR code content</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No location tracking or device fingerprinting</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No analytics, advertising IDs, or usage metrics</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No cloud syncing or server uploads</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="block" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No third-party trackers or SDKs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data We Store Locally</Text>
          <Text style={styles.paragraph}>
            The following data is stored only on your device and never leaves it:
          </Text>
          <View style={styles.listItem}>
            <MaterialIcons name="storage" size={20} color="#00D9FF" />
            <Text style={styles.listText}>
              <Text style={styles.bold}>Premium Status:</Text> Whether you've purchased the premium
              upgrade
            </Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="storage" size={20} color="#00D9FF" />
            <Text style={styles.listText}>
              <Text style={styles.bold}>Generation Count:</Text> Number of QR codes you've
              generated (for free tier limits)
            </Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="storage" size={20} color="#00D9FF" />
            <Text style={styles.listText}>
              <Text style={styles.bold}>PIN Code:</Text> Your 4-digit PIN (if enabled, stored
              encrypted)
            </Text>
          </View>
          <Text style={styles.paragraph}>
            This data is stored using secure device storage APIs and is never transmitted to any
            server.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera Permission</Text>
          <Text style={styles.paragraph}>
            Code Vault requires camera access to scan QR codes. The camera is only used for
            real-time QR code detection. We do not save, upload, or analyze camera footage. Images
            are processed locally on your device and immediately discarded after scanning.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Encryption</Text>
          <Text style={styles.paragraph}>
            When you generate encrypted QR codes, the encryption happens entirely on your device
            using industry-standard cryptographic algorithms. Neither the original data nor the
            encryption key ever leaves your device. Encrypted QR codes can only be decrypted by
            other Code Vault users who have the correct passkey.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Purchase</Text>
          <Text style={styles.paragraph}>
            Premium purchases are processed through your device's app store (Apple App Store or
            Google Play Store). We do not handle payment information directly. The app store shares
            only the minimum information required to verify your purchase status. This typically
            includes a transaction ID and purchase confirmation, but never your payment details.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No Internet Required</Text>
          <Text style={styles.paragraph}>
            Code Vault is designed to work completely offline. The app does not make network
            requests, does not connect to any servers, and does not transmit any data over the
            internet. All functionality is performed locally on your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Code Vault does not collect any personal information from anyone, including children
            under 13. The app is designed to be privacy-safe for all ages.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            Since all data is stored locally on your device, you have complete control:
          </Text>
          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={20} color="#00D9FF" />
            <Text style={styles.listText}>Delete all data by uninstalling the app</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={20} color="#00D9FF" />
            <Text style={styles.listText}>Reset your PIN anytime from Settings</Text>
          </View>
          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={20} color="#00D9FF" />
            <Text style={styles.listText}>No account deletion needed - we have no accounts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            If we make changes to this privacy policy, we will update the "Last Updated" date at
            the top. We will notify users of significant changes through an in-app notification on
            the next app update. However, our core privacy commitment will never change: your data
            stays on your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>
            If you have questions about this privacy policy or Code Vault's privacy practices,
            please contact us at:
          </Text>
          <Text style={styles.contactText}>privacy@codevault.app</Text>
        </View>

        <View style={styles.footer}>
          <MaterialIcons name="verified-user" size={32} color="#00D9FF" />
          <Text style={styles.footerText}>
            Your privacy is protected.{'\n'}
            All data stays on your device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9FF',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listText: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  contactText: {
    fontSize: 15,
    color: '#00D9FF',
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  footerText: {
    fontSize: 15,
    color: '#00D9FF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
});