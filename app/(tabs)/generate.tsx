import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePremium } from '@/hooks/usePremium';
import { PremiumCard } from '@/components/PremiumCard';
import { QRDisplay } from '@/components/QRDisplay';
import { CategoryPicker } from '@/components/CategoryPicker';
import { ColorPicker } from '@/components/ColorPicker';
import { QuantumQRGenerator } from '@/components/QuantumQRGenerator';
import { QuantumQRDisplay } from '@/components/QuantumQRDisplay';
import { qrService } from '@/services/qr';
import { quantumQRService } from '@/services/quantumQR';
import { storageService } from '@/services/storage';
import type { QRDataType, ContactData, LocationData, SavedQRCode, QRCategory } from '@/types/qr';
import type { QuantumLayerConfig, QuantumQRCode } from '@/types/quantumQR';

type GenerateMode = QRDataType | 'quantum' | null;

export default function GenerateScreen() {
  const [mode, setMode] = useState<GenerateMode>(null);
  const [generatedQR, setGeneratedQR] = useState<SavedQRCode | null>(null);
  const [generatedQuantumQR, setGeneratedQuantumQR] = useState<QuantumQRCode | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [categories, setCategories] = useState<QRCategory[]>([]);
  const [systemPIN, setSystemPIN] = useState<string>();
  const { canGenerate, incrementGeneration, remainingGenerations, isPremium } = usePremium();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadCategories();
    loadPIN();
  }, []);

  const loadCategories = async () => {
    const cats = await storageService.getCategories();
    setCategories(cats);
  };

  const loadPIN = async () => {
    const pinConfig = await storageService.getPINConfig();
    if (pinConfig.enabled) {
      setSystemPIN(pinConfig.pin);
    }
  };

  const handleTypeSelect = (type: QRDataType | 'quantum') => {
    if (!canGenerate) {
      setShowUpgrade(true);
      return;
    }
    if (type === 'quantum' && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    setMode(type);
  };

  const handleGenerate = async (qrCode: SavedQRCode) => {
    if (!canGenerate) {
      setShowUpgrade(true);
      return;
    }

    await incrementGeneration();
    await storageService.saveQRCode(qrCode);
    setGeneratedQR(qrCode);
    setMode(null);
  };

  const handleGenerateQuantum = async (name: string, layers: QuantumLayerConfig[]) => {
    if (!canGenerate) {
      setShowUpgrade(true);
      return;
    }

    if (!systemPIN) {
      Alert.alert(
        'PIN Required',
        'Quantum QR requires a PIN to encrypt private and hidden layers. Please enable PIN in Settings first.'
      );
      return;
    }

    try {
      const quantumQR = await quantumQRService.generateQuantumQR(name, layers, systemPIN);
      await incrementGeneration();
      await storageService.saveQuantumQR(quantumQR);
      setGeneratedQuantumQR(quantumQR);
      setMode(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate Quantum QR');
    }
  };

  const qrTypes = [
    { type: 'quantum' as const, icon: 'layers', label: 'Quantum QR', color: '#9C27B0', premium: true },
    { type: 'text' as QRDataType, icon: 'text-fields', label: 'Text', color: '#00D9FF' },
    { type: 'url' as QRDataType, icon: 'link', label: 'URL', color: '#00D9FF' },
    { type: 'email' as QRDataType, icon: 'email', label: 'Email', color: '#00D9FF' },
    { type: 'sms' as QRDataType, icon: 'sms', label: 'SMS', color: '#00D9FF' },
    { type: 'contact' as QRDataType, icon: 'contacts', label: 'Contact', color: '#00D9FF' },
    { type: 'location' as QRDataType, icon: 'location-on', label: 'Location', color: '#00D9FF' },
    { type: 'wallet' as QRDataType, icon: 'account-balance-wallet', label: 'Wallet', color: '#FFD700' },
    { type: 'encrypted' as QRDataType, icon: 'lock', label: 'Encrypted', color: '#FF4444' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <MaterialIcons name="add-box" size={32} color="#00D9FF" />
          <Text style={styles.headerTitle}>Generate QR Code</Text>
        </View>

        <View style={styles.limitBadge}>
          <MaterialIcons name="info-outline" size={16} color="#00D9FF" />
          <Text style={styles.limitText}>
            {remainingGenerations === -1
              ? 'Unlimited generations'
              : `${remainingGenerations} generations remaining`}
          </Text>
        </View>

        <View style={styles.typesGrid}>
          {qrTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={styles.typeCard}
              onPress={() => handleTypeSelect(item.type)}
            >
              <MaterialIcons name={item.icon as any} size={32} color={item.color} />
              <Text style={styles.typeLabel}>{item.label}</Text>
              {item.premium && !isPremium && (
                <MaterialIcons name="stars" size={16} color="#FFD700" style={styles.premiumBadge} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {!isPremium && <PremiumCard onUpgrade={() => setShowUpgrade(true)} />}
      </ScrollView>

      <Modal visible={mode !== null} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {mode === 'quantum' ? (
              <QuantumQRGenerator
                isPremium={isPremium}
                onGenerate={handleGenerateQuantum}
                onClose={() => setMode(null)}
                onUpgrade={() => setShowUpgrade(true)}
              />
            ) : (
              mode && (
                <GenerateForm
                  type={mode}
                  categories={categories}
                  isPremium={isPremium}
                  onGenerate={handleGenerate}
                  onClose={() => setMode(null)}
                  onUpgrade={() => setShowUpgrade(true)}
                />
              )
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={generatedQR !== null} animationType="slide">
        <View style={{ flex: 1 }}>
          {generatedQR && (
            <QRDisplay
              data={generatedQR.data}
              title={generatedQR.name || 'Generated QR Code'}
              color={generatedQR.color}
              backgroundColor={generatedQR.backgroundColor}
              onClose={() => setGeneratedQR(null)}
            />
          )}
        </View>
      </Modal>

      <Modal visible={generatedQuantumQR !== null} animationType="slide">
        <View style={{ flex: 1 }}>
          {generatedQuantumQR && (
            <QuantumQRDisplay
              quantumQR={generatedQuantumQR}
              systemPIN={systemPIN}
              onClose={() => setGeneratedQuantumQR(null)}
            />
          )}
        </View>
      </Modal>

      <Modal visible={showUpgrade} animationType="slide" transparent>
        <View style={styles.upgradeModal}>
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeMessage}>
              You have reached the free generation limit. Upgrade to Premium for unlimited QR code generation.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setShowUpgrade(false)}
            >
              <Text style={styles.upgradeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function GenerateForm({
  type,
  categories,
  isPremium,
  onGenerate,
  onClose,
  onUpgrade,
}: {
  type: QRDataType;
  categories: QRCategory[];
  isPremium: boolean;
  onGenerate: (qrCode: SavedQRCode) => void;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [qrName, setQrName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedBackground, setSelectedBackground] = useState('#FFFFFF');

  const handleSubmit = () => {
    let qrData = '';

    switch (type) {
      case 'text':
        qrData = qrService.generateText(text).data;
        break;
      case 'url':
        qrData = qrService.generateURL(url).data;
        break;
      case 'email':
        qrData = qrService.generateEmail(email, subject, body).data;
        break;
      case 'sms':
        qrData = qrService.generateSMS(phone, message).data;
        break;
      case 'contact':
        const contact: ContactData = {
          name,
          phone: contactPhone,
          email: contactEmail,
          organization,
        };
        qrData = qrService.generateContact(contact).data;
        break;
      case 'location':
        const location: LocationData = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          label: locationLabel,
        };
        qrData = qrService.generateLocation(location).data;
        break;
      case 'wallet':
        qrData = qrService.generateWallet(walletAddress).data;
        break;
      default:
        return;
    }

    const savedQR: SavedQRCode = {
      id: `qr_${Date.now()}`,
      type,
      data: qrData,
      createdAt: Date.now(),
      name: qrName || undefined,
      category: selectedCategory,
      color: selectedColor,
      backgroundColor: selectedBackground,
    };

    onGenerate(savedQR);
  };

  const renderForm = () => {
    switch (type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder="Enter text"
            placeholderTextColor="#666666"
            value={text}
            onChangeText={setText}
            multiline
          />
        );
      case 'url':
        return (
          <TextInput
            style={styles.input}
            placeholder="Enter URL"
            placeholderTextColor="#666666"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
        );
      case 'email':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Subject (optional)"
              placeholderTextColor="#666666"
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput
              style={styles.input}
              placeholder="Body (optional)"
              placeholderTextColor="#666666"
              value={body}
              onChangeText={setBody}
              multiline
            />
          </>
        );
      case 'sms':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#666666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Message (optional)"
              placeholderTextColor="#666666"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </>
        );
      case 'contact':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              placeholderTextColor="#666666"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#666666"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Organization (optional)"
              placeholderTextColor="#666666"
              value={organization}
              onChangeText={setOrganization}
            />
          </>
        );
      case 'location':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              placeholderTextColor="#666666"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              placeholderTextColor="#666666"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Label (optional)"
              placeholderTextColor="#666666"
              value={locationLabel}
              onChangeText={setLocationLabel}
            />
          </>
        );
      case 'wallet':
        return (
          <TextInput
            style={styles.input}
            placeholder="Wallet address"
            placeholderTextColor="#666666"
            value={walletAddress}
            onChangeText={setWalletAddress}
            autoCapitalize="none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Generate {type.toUpperCase()} QR</Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="QR Code name (optional)"
        placeholderTextColor="#666666"
        value={qrName}
        onChangeText={setQrName}
      />

      <CategoryPicker
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isPremium={isPremium}
        onUpgrade={onUpgrade}
      />

      <ColorPicker
        selectedForeground={selectedColor}
        selectedBackground={selectedBackground}
        onSelectColor={(fg, bg) => {
          setSelectedColor(fg);
          setSelectedBackground(bg);
        }}
        isPremium={isPremium}
        onUpgrade={onUpgrade}
      />

      {renderForm()}

      <TouchableOpacity style={styles.generateButton} onPress={handleSubmit}>
        <Text style={styles.generateButtonText}>Generate QR Code</Text>
        <MaterialIcons name="qr-code" size={20} color="#000000" />
      </TouchableOpacity>
    </ScrollView>
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
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  limitText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  typeCard: {
    width: '46%',
    backgroundColor: '#1A1A2E',
    margin: '2%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  typeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#0F0F1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  generateButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  generateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  upgradeModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  upgradeContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  upgradeMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});