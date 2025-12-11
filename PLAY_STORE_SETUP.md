# Google Play Store In-App Purchase Setup

## 📋 Prerequisites
- Google Play Console account
- App uploaded to Play Console (at least Internal Testing track)
- Merchant account linked to Play Console

---

## 🛒 Step 1: Create In-App Product

1. **Navigate to Monetization**
   - Open your app in Google Play Console
   - Go to: **Monetize → In-app products**

2. **Create New Product**
   - Click **Create product**
   - Product ID: `codevault_premium` (MUST match exactly)
   - Product Type: **In-app purchase** (not subscription)

3. **Configure Product Details**
   - **Name**: Code Vault Premium
   - **Description**: Unlock unlimited QR generation, PIN protection, encrypted sharing, and multi-layer Quantum QR codes.
   - **Default Price**: $4.99 USD
   - **Status**: Set to **Active**

4. **Save and Activate**
   - Click **Save**
   - Ensure status is **Active** (not Draft)

---

## 🧪 Step 2: Test the Purchase

### Option A: License Testing (Recommended)
1. Go to **Settings → License Testing**
2. Add test Gmail accounts
3. Set license response to: **RESPOND_NORMALLY**
4. Install app on device using test account
5. Purchase will succeed without actual charge

### Option B: Internal Testing Track
1. Upload APK to **Internal Testing** track
2. Add testers via email or create tester list
3. Testers can make real purchases (will be refunded)

---

## 📱 Step 3: Build and Deploy

### Update Version Code
```json
// In app.json
"android": {
  "versionCode": 3,  // Increment from current version
  "package": "app.onhercules.coin_vault.twa"
}
```

### Build APK/AAB
```bash
# Install dependencies first
npm install expo-in-app-purchases

# Build Android App Bundle
eas build --platform android --profile production
```

### Upload to Play Console
1. Go to **Production → Releases**
2. Create new release
3. Upload AAB file
4. Add release notes
5. **Review → Roll out to Production**

---

## ⚠️ Important Notes

### Product ID Must Match
The code uses: `codevault_premium`
If you use a different ID, update `hooks/usePremium.ts`:
```typescript
const PREMIUM_PRODUCT_ID = 'your_custom_id';
```

### App Must Be Published
- In-app purchases only work after app is published (at least to Internal Testing)
- Purchases in debug/development builds will fail

### First Purchase May Take Time
- Google Play can take 2-24 hours to propagate IAP products
- If "Product not found" error, wait and try again

---

## 🔍 Troubleshooting

### "Product not found"
- Verify product ID matches exactly: `codevault_premium`
- Ensure product status is **Active** (not Draft)
- Wait 2-24 hours after creating product
- App must be uploaded to at least Internal Testing track

### "Purchase failed"
- Check license testing is enabled
- Verify test account has payment method (even for test purchases)
- Ensure app is signed with same key as Play Console

### "Item already owned"
- In Play Console, go to **Order Management**
- Find and refund the test purchase
- Or use a different test account

---

## 📊 Data Safety Declaration

Update your Play Console **Data Safety** form:

### Does your app collect or share user data?
✅ **YES** (changed from NO)

### Data Types Collected
- **Purchase History**: For verifying premium status
- **Purpose**: App functionality (premium features)
- **Collected**: YES | **Shared**: NO
- **Encrypted in transit**: YES (handled by Google Play Billing)
- **Users can request deletion**: YES (refund purchase)

### Why Network Access?
> "Code Vault uses internet connectivity solely for processing premium upgrades through Google Play Billing. All QR scanning, generation, and artifact features remain fully offline. No user data, scan history, or QR content is transmitted."

---

## ✅ Verification Checklist

Before submitting to production:

- [ ] Product `codevault_premium` created and **Active** in Play Console
- [ ] Price set to $4.99 USD
- [ ] License testing configured with test accounts
- [ ] Test purchase successful (no errors)
- [ ] Purchase restores correctly after reinstall
- [ ] Data Safety form updated to include purchase history
- [ ] Privacy policy updated (already done in code)
- [ ] Version code incremented in app.json

---

## 🎯 Expected User Flow

1. User opens app → sees "X free generations remaining"
2. Taps **Upgrade to Premium**
3. Modal appears: "Continue to Payment"
4. Google Play billing sheet opens
5. User confirms $4.99 purchase
6. Premium unlocked immediately
7. Badge shows "Premium Active"

---

## 💰 Revenue & Payouts

- **Google's Cut**: 15% (for first $1M annual revenue)
- **Your Cut**: 85% ($4.24 per sale)
- **Payout Schedule**: Monthly (after $100 threshold)
- **Payout Methods**: Bank transfer, Wire transfer

---

Need help? Check errors in:
- Play Console → **Order Management** (purchase logs)
- App logs: `console.error` in `hooks/usePremium.ts`
