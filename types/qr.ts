export const FREE_GENERATION_LIMIT = 10;

export interface PremiumStatus {
  isPremium: boolean;
  purchaseDate?: number;
  generationCount: number;
}

export type QRCategory = 
  | 'url'
  | 'email'
  | 'sms'
  | 'phone'
  | 'contact'
  | 'wallet'
  | 'text'
  | 'wifi'
  | 'location'
  | 'encrypted';

export interface QRData {
  category: QRCategory;
  data: string;
  timestamp: number;
}

export interface CategoryInfo {
  type: QRCategory;
  label: string;
  icon: string;
  color: string;
  placeholder: string;
  description: string;
}

export const QR_CATEGORIES: CategoryInfo[] = [
  {
    type: 'url',
    label: 'Website URL',
    icon: 'language',
    color: '#00D9FF',
    placeholder: 'https://example.com',
    description: 'Create a QR code for any website link',
  },
  {
    type: 'email',
    label: 'Email Address',
    icon: 'email',
    color: '#FF6B9D',
    placeholder: 'user@example.com',
    description: 'Generate QR for email contact',
  },
  {
    type: 'sms',
    label: 'SMS Message',
    icon: 'message',
    color: '#FFD700',
    placeholder: 'Enter message text',
    description: 'Create a text message QR code',
  },
  {
    type: 'phone',
    label: 'Phone Number',
    icon: 'phone',
    color: '#4CAF50',
    placeholder: '+1234567890',
    description: 'Generate phone number QR',
  },
  {
    type: 'contact',
    label: 'Contact Card',
    icon: 'contacts',
    color: '#9C27B0',
    placeholder: 'Name;Phone;Email',
    description: 'Create vCard contact information',
  },
  {
    type: 'wallet',
    label: 'Crypto Wallet',
    icon: 'account-balance-wallet',
    color: '#FF9800',
    placeholder: 'wallet_address_here',
    description: 'Generate cryptocurrency wallet QR',
  },
  {
    type: 'text',
    label: 'Plain Text',
    icon: 'text-fields',
    color: '#03A9F4',
    placeholder: 'Any text content',
    description: 'Create QR from any text',
  },
  {
    type: 'wifi',
    label: 'WiFi Network',
    icon: 'wifi',
    color: '#00BCD4',
    placeholder: 'SSID;Password;WPA',
    description: 'Generate WiFi connection QR',
  },
  {
    type: 'location',
    label: 'GPS Location',
    icon: 'location-on',
    color: '#E91E63',
    placeholder: 'Latitude,Longitude',
    description: 'Create location coordinates QR',
  },
  {
    type: 'encrypted',
    label: 'Encrypted Message',
    icon: 'lock',
    color: '#F44336',
    placeholder: 'Secret message',
    description: 'Premium: Encrypted QR code',
  },
];
