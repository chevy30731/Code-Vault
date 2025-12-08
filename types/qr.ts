export type QRDataType = 
  | 'text' 
  | 'url' 
  | 'email' 
  | 'sms' 
  | 'contact' 
  | 'location'
  | 'wallet'
  | 'image'
  | 'encrypted';

export interface QRData {
  type: QRDataType;
  data: string;
  encrypted?: boolean;
  timestamp?: number;
  category?: string;
  color?: string;
  backgroundColor?: string;
}

export interface SavedQRCode extends QRData {
  id: string;
  createdAt: number;
  name?: string;
}

export interface ContactData {
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
  website?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  purchaseDate?: number;
  generationCount: number;
}

export interface PINConfig {
  enabled: boolean;
  pin: string;
}

export interface QRCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const FREE_GENERATION_LIMIT = 10;

export const DEFAULT_CATEGORIES: QRCategory[] = [
  { id: 'personal', name: 'Personal', icon: 'person', color: '#00D9FF' },
  { id: 'work', name: 'Work', icon: 'work', color: '#FFD700' },
  { id: 'finance', name: 'Finance', icon: 'account-balance-wallet', color: '#4CAF50' },
  { id: 'social', name: 'Social', icon: 'share', color: '#FF4444' },
  { id: 'other', name: 'Other', icon: 'folder', color: '#9C27B0' },
];

export const QR_COLOR_PRESETS = [
  { name: 'Classic', foreground: '#000000', background: '#FFFFFF' },
  { name: 'Cyan', foreground: '#00D9FF', background: '#0F0F1E' },
  { name: 'Gold', foreground: '#FFD700', background: '#1A1A2E' },
  { name: 'Mint', foreground: '#4CAF50', background: '#E8F5E9' },
  { name: 'Coral', foreground: '#FF4444', background: '#FFEBEE' },
  { name: 'Purple', foreground: '#9C27B0', background: '#F3E5F5' },
];