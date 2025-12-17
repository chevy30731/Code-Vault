# Google Play Console - Data Safety Form Guide

**For Code Vault v2.0.0 - Complete Declaration Requirements**

---

## ✅ Step-by-Step Data Safety Form

### **Section 1: Does your app collect or share user data?**

**Answer: YES**

**Explanation:** While Code Vault is privacy-first and offline, Google Play Billing collects purchase data for premium upgrades. You MUST declare this.

---

### **Section 2: Data Types Collected**

Select and configure the following data types:

#### 📱 **App Activity**
- **Purchase history**
  - ✅ Is this data collected, shared, or both? → **Collected**
  - ✅ Is this data processed ephemerally? → **NO**
  - ✅ Is collection optional? → **NO** (required for premium verification)
  - ✅ What is the purpose? → **App functionality** (to verify premium status)

#### 🔐 **Device or other IDs**
- **Device or other IDs** (Google Play uses this for purchase verification)
  - ✅ Is this data collected, shared, or both? → **Collected**
  - ✅ Is this data processed ephemerally? → **NO**
  - ✅ Is collection optional? → **NO**
  - ✅ What is the purpose? → **App functionality** (to link purchase to device)

---

### **Section 3: Data Security**

#### **Is all of the user data collected by your app encrypted in transit?**
**Answer: YES**

**Explanation:** Google Play Billing uses HTTPS encryption for all purchase transactions.

---

#### **Do you provide a way for users to request their data be deleted?**
**Answer: YES**

**Explanation:** Users can request deletion by:
1. Uninstalling the app (removes all local data)
2. Contacting support@onhercules.app to request purchase record deletion from Google Play

---

### **Section 4: Data Usage and Handling**

For each data type you declared:

#### **Purchase History:**
- **Why is this data collected?**
  - ✅ App functionality (to unlock premium features)
  
- **How is this data shared?**
  - ✅ Not shared with third parties
  
- **Is this data required or optional?**
  - Required for users who want premium features
  - Optional (free tier works without purchase data)

#### **Device IDs:**
- **Why is this data collected?**
  - ✅ App functionality (to verify purchases across app reinstalls)
  
- **How is this data shared?**
  - ✅ Not shared with third parties (only used by Google Play Billing)

---

## 📄 **Privacy Policy URL**

You need to host your privacy policy at a publicly accessible URL. Here are your options:

### **Option 1: Use OnSpace Hosted URL (Recommended for Testing)**
If your app is deployed via OnSpace:
- Deploy your app to OnSpace
- Privacy policy will be available at: `https://[your-app-url]/privacy`
- Use this URL in Play Console

### **Option 2: Create GitHub Pages (Free, Permanent)**
1. Create a GitHub repository
2. Create `privacy.html` with your privacy policy content
3. Enable GitHub Pages in repo settings
4. URL will be: `https://[username].github.io/[repo-name]/privacy.html`

### **Option 3: Use a Simple Hosting Service**
- **Netlify/Vercel** (free)
- **Google Sites** (free)
- Upload a simple HTML version of your privacy policy

**For now, use this temporary URL format in Play Console:**
```
https://onhercules.app/codevault/privacy
```
*(You'll need to replace this with your actual hosted URL before going live)*

---

## 🚨 **Permissions Justification**

When Google asks why you need certain permissions:

### **CAMERA**
**Purpose:** "Required to scan QR codes in real-time. Camera is only used for QR code detection. No images are saved or transmitted."

### **INTERNET + ACCESS_NETWORK_STATE**
**Purpose:** "Required exclusively for Google Play in-app purchase processing and verification. All QR code scanning, generation, and encryption features work completely offline and do not use network connectivity."

---

## ✅ **Pre-Submission Checklist**

Before submitting your app to Play Console:

- [ ] Data Safety form declares "Purchase History" and "Device IDs"
- [ ] Both data types marked as "Collected" (not shared)
- [ ] Data encryption in transit = YES
- [ ] User data deletion option = YES
- [ ] Privacy policy URL added to Store Listing
- [ ] Camera permission justified
- [ ] Internet permission justified as "IAP only"
- [ ] IAP product `codevault_premium` created and activated in Play Console
- [ ] App version code incremented (currently: 2)

---

## 📝 **Store Listing - Privacy Section**

In the "Store Listing" section, you'll also need to fill:

### **App access**
- ✅ All functionality is available without special access
- Camera permission requested at runtime

### **Privacy Policy**
- **URL:** `https://onhercules.app/codevault/privacy` (or your hosted URL)

### **Data safety**
- This is auto-filled based on your Data Safety form answers

---

## ⚠️ **Common Rejection Reasons - AVOIDED**

✅ **Mismatch between permissions and declaration** → FIXED (we now declare IAP data)
✅ **Missing privacy policy URL** → FIXED (you have privacy.tsx route)
✅ **Unexplained INTERNET permission** → FIXED (justified as IAP-only)
✅ **Claiming "no data collection" while using IAP** → FIXED (we declare purchases)

---

## 🎯 **Quick Reference: What to Declare**

| Question | Answer | Reason |
|----------|--------|---------|
| Collect or share data? | **YES** | Google Play IAP collects purchase data |
| What data types? | Purchase history, Device IDs | Required for IAP verification |
| Data encrypted? | **YES** | Google Play uses HTTPS |
| Allow deletion? | **YES** | Uninstall app or contact support |
| Privacy policy URL? | Your hosted URL | Required for all apps with IAP |

---

## 🚀 **Next Steps**

1. **Fill out Data Safety form** in Play Console using this guide
2. **Create IAP product** `codevault_premium` for $4.99
3. **Add privacy policy URL** to Store Listing
4. **Submit for review**

Your app is now compliant with Google Play's data transparency requirements!

**Need help?** Email support@onhercules.app
