# Code Vault - Privacy-First QR Scanner & Generator

**Built with privacy, security, and sovereignty at the core.**

Code Vault is your all-in-one offline QR utility designed for privacy, autonomy, and control. Scan, decode, and generate QR codes directly from your device — no internet required (except for premium purchases), no data tracking, no compromises.

## 🌟 Features

### Free Features
- **QR Scanner**: Real-time QR code scanning with cockpit-style targeting reticle
- **QR Generator**: Create QR codes for URLs, emails, SMS, contacts, locations, wallets, and encrypted data
- **Threat Detection**: Real-time security analysis with color-coded safety levels (safe/warning/danger)
- **Scan Logging**: Automatic GPS timestamps, threat analysis, and encrypted export
- **Scan Profiles**: Silent, Wallet, Legacy, and Artifact modes with auto-actions
- **Artifact Mode**: Catalog physical artifacts with provenance documentation
- **Timeline History**: Filter by type, threat level, and scan profile
- **Offline-First**: Works completely without internet (except IAP)
- **Zero Tracking**: No analytics, no data collection, no cloud sync

### Premium Features ($4.99 One-Time)
- **Unlimited QR Generation**: No limits, no subscriptions
- **4-Digit PIN Lock**: Protect sensitive codes with personal PIN
- **Quantum QR Codes**: Multi-layer QR codes with public, private, and hidden layers
  - Public layers: Instantly accessible
  - Private layers: Biometric/PIN authentication required
  - Hidden layers: Developer mode only
- **Self-Destruct Mode**: QR codes with time-based or scan-count expiration
- **Encrypted Sharing**: End-to-end encrypted QR codes for Code Vault users
- **Custom QR Skins**: Cockpit, Tribal, and Artifact frame styles

## 🛡️ Privacy Commitment

**What We DON'T Collect:**
- ❌ No scan history uploaded
- ❌ No location tracking (GPS is local-only for artifact cataloging)
- ❌ No analytics or advertising IDs
- ❌ No cloud syncing
- ❌ No third-party trackers or SDKs

**What We Store (Locally Only):**
- ✅ Premium purchase status (verified via Google Play/App Store)
- ✅ Generation count (for free tier limits)
- ✅ PIN code (encrypted, device-only)
- ✅ Scan logs (stored locally, can be encrypted on export)

**Limited Internet Usage:**
- Only for Google Play Billing / Apple App Store IAP
- All QR features work completely offline
- See [Privacy Policy](./app/privacy.tsx) for full details

## 🏗️ Architecture

### Tech Stack
- **React Native + Expo SDK 53**
- **TypeScript**
- **Expo Router** (file-based navigation)
- **Expo Camera** (QR scanning)
- **Expo In-App Purchases** (Google Play Billing / StoreKit)
- **AsyncStorage** (local data persistence)

### Project Structure
```
code-vault/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Scan screen (main)
│   │   ├── capture.tsx    # Artifact capture
│   │   ├── archive.tsx    # Artifact archive
│   │   ├── generate.tsx   # QR generator
│   │   ├── history.tsx    # Scan history/timeline
│   │   └── settings.tsx   # Settings + Premium upgrade
│   ├── _layout.tsx        # Root layout
│   └── privacy.tsx        # Privacy policy screen
├── components/            # Reusable UI components
│   ├── PremiumCard.tsx   # Premium upgrade card
│   ├── QuantumQRGenerator.tsx
│   ├── QuantumQRDisplay.tsx
│   ├── QRDisplay.tsx
│   ├── PINInput.tsx
│   ├── ThreatIndicator.tsx
│   ├── ScanProfileSelector.tsx
│   ├── CategoryPicker.tsx
│   └── ColorPicker.tsx
├── hooks/                 # Custom React hooks
│   ├── usePremium.ts     # Premium status + IAP logic
│   └── usePIN.ts         # PIN authentication
├── services/             # Business logic layer
│   ├── qr.ts             # QR data generation/parsing
│   ├── quantumQR.ts      # Multi-layer QR logic
│   ├── encryption.ts     # AES encryption
│   ├── artifact.ts       # Artifact cataloging
│   ├── scanLog.ts        # Scan logging + export
│   ├── threatDetection.ts # Security analysis
│   ├── storage.ts        # AsyncStorage wrapper
│   ├── export.ts         # JSON/CSV export
│   └── imageCompression.ts
├── types/                # TypeScript definitions
│   ├── qr.ts
│   ├── quantumQR.ts
│   ├── artifact.ts
│   └── scanLog.ts
└── PLAY_STORE_SETUP.md  # Google Play IAP configuration guide
```

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18
npm or yarn
Expo CLI
```

### Installation
```bash
# Install dependencies
npm install

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on Web (IAP disabled)
npx expo start --web
```

### Building for Production

**Android APK/AAB:**
```bash
# Increment versionCode in app.json first
eas build --platform android --profile production
```

**iOS IPA:**
```bash
eas build --platform ios --profile production
```

## 💰 Google Play In-App Purchase Setup

### Step 1: Create Product in Play Console
1. Go to **Monetize → In-app products**
2. Create product with ID: `codevault_premium`
3. Price: $4.99 USD
4. Set status to **Active**

### Step 2: Configure License Testing
1. Go to **Settings → License Testing**
2. Add test Gmail accounts
3. Set response to **RESPOND_NORMALLY**

### Step 3: Upload to Internal Testing
- Upload AAB to Internal Testing track
- Testers can purchase without charge
- Wait 2-24 hours for IAP products to propagate

### Step 4: Update Data Safety Form
**Important:** Update Play Console Data Safety to include:
- **Purchase History**: Collected for app functionality
- **Encrypted in transit**: YES (Google Play Billing)
- **Users can request deletion**: YES (refund purchase)

See [PLAY_STORE_SETUP.md](./PLAY_STORE_SETUP.md) for complete instructions.

## 🔑 Key Features Implementation

### Quantum QR Codes
Multi-layer QR codes with progressive unlock:
```typescript
// Public layer: Always visible
// Private layer: PIN or biometric required
// Hidden layer: Developer mode only

const quantumQR = await quantumQRService.generateQuantumQR(
  'Confidential Document',
  [
    { type: 'public', name: 'Public Info', data: 'Company XYZ' },
    { type: 'private', name: 'Credentials', data: 'username:password' },
    { type: 'hidden', name: 'Debug Log', data: 'crash_log_001' },
  ],
  systemPIN,
  { type: 'time', expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
);
```

### Threat Detection
Real-time security analysis:
```typescript
const threatLevel = threatDetectionService.analyzeThreat(qrData, scanType);
// Returns: 'safe' | 'warning' | 'danger'

// Checks for:
// - URL shorteners (phishing risk)
// - Suspicious keywords (verify, urgent, etc.)
// - IP addresses
// - Excessive URL parameters
```

### Scan Profiles
Auto-actions based on context:
- **Standard**: Normal preview
- **Silent**: Auto-copy without preview
- **Wallet**: Auto-open crypto wallet
- **Legacy**: Archive + export with GPS
- **Artifact**: Tag + GPS + timestamp

### Artifact Cataloging
Museum-grade provenance tracking:
```typescript
const artifact: ArtifactMetadata = {
  id: 'ART-2025-001',
  name: 'Ancient Coin',
  type: 'coin',
  material: 'bronze',
  estimatedAge: '200 BCE',
  provenance: {
    location: { latitude: 41.9028, longitude: 12.4964, site: 'Rome Forum' },
    discoveryDate: Date.now(),
    discoveredBy: 'John Doe',
  },
  appraisal: {
    description: 'Roman denarius, well-preserved',
    authenticity: 'verified',
  },
  legal: {
    ownership: 'personal',
    acquisitionMethod: 'purchase',
  },
};
```

## 📱 User Flow

### First-Time User
1. Open app → Scan tab (camera permission request)
2. Scan QR code → Threat analysis → Display result
3. Generate QR → Reach free limit (10/10)
4. See premium upgrade prompt
5. Tap "Upgrade Now" → Google Play Billing dialog
6. Purchase $4.99 → Premium activated

### Premium User
1. Unlimited QR generation
2. Settings → Enable PIN protection
3. Generate → Quantum QR with 3 layers
4. Scan own Quantum QR → Unlock private layers with PIN
5. History → Export scan logs (encrypted)
6. Capture → Photograph artifact → Generate provenance QR

## 🐛 Troubleshooting

### "Product not found" error
- Verify product ID is `codevault_premium`
- Check product status is **Active** (not Draft)
- Wait 2-24 hours after creating product
- App must be uploaded to Internal Testing track

### "Cannot find native module 'ExpoInAppPurchases'" on web
- Expected behavior: IAP only works on iOS/Android
- Web uses local storage fallback for testing

### "Item already owned"
- Go to Play Console → Order Management
- Refund test purchase
- Or use different test account

## 📄 License

Proprietary - All Rights Reserved

## 📧 Contact

**Privacy Concerns:** privacy@codevault.app  
**Support:** contact@onspace.ai

---

**Built with privacy, owned by you.**
