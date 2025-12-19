export type ScanProfile = 'standard' | 'silent' | 'wallet' | 'legacy' | 'artifact';

export type ThreatLevel = 'safe' | 'warning' | 'danger';

export interface ScanLog {
  id: string;
  data: string;
  type: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  profile: ScanProfile;
  threatLevel: ThreatLevel;
  tags: string[];
  notes?: string;
}

export interface ScanProfileInfo {
  type: ScanProfile;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const SCAN_PROFILES: ScanProfileInfo[] = [
  {
    type: 'standard',
    label: 'Standard',
    icon: 'qr-code-scanner',
    color: '#00D9FF',
    description: 'Normal scan with preview',
  },
  {
    type: 'silent',
    label: 'Silent',
    icon: 'notifications-off',
    color: '#999999',
    description: 'Auto-copy without preview',
  },
  {
    type: 'wallet',
    label: 'Wallet',
    icon: 'account-balance-wallet',
    color: '#FFD700',
    description: 'Crypto wallet auto-open',
  },
  {
    type: 'legacy',
    label: 'Legacy',
    icon: 'folder-special',
    color: '#9C27B0',
    description: 'Archive and export',
  },
  {
    type: 'artifact',
    label: 'Artifact',
    icon: 'bookmark',
    color: '#FF6B9D',
    description: 'Tag + GPS + Timestamp',
  },
];
