export interface ScanLog {
  id: string;
  timestamp: number;
  type: 'quantum' | 'artifact' | 'standard' | 'wallet' | 'encrypted';
  data: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  tags?: string[];
  threatLevel: 'safe' | 'warning' | 'danger';
  profile?: ScanProfile;
  metadata?: {
    quantumLayers?: number;
    artifactId?: string;
    expirationStatus?: 'valid' | 'expired' | 'near-expiry';
    scanCount?: number;
  };
}

export type ScanProfile = 'silent' | 'wallet' | 'legacy' | 'artifact' | 'standard';

export interface ScanProfileConfig {
  id: ScanProfile;
  name: string;
  description: string;
  icon: string;
  color: string;
  autoCopy: boolean;
  autoOpen: boolean;
  autoArchive: boolean;
  addGPS: boolean;
  showPreview: boolean;
}

export const SCAN_PROFILES: ScanProfileConfig[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Default scan with preview',
    icon: 'qr-code-scanner',
    color: '#00D9FF',
    autoCopy: false,
    autoOpen: false,
    autoArchive: false,
    addGPS: false,
    showPreview: true,
  },
  {
    id: 'silent',
    name: 'Silent Scan',
    description: 'Auto-copy without preview',
    icon: 'content-copy',
    color: '#9C27B0',
    autoCopy: true,
    autoOpen: false,
    autoArchive: true,
    addGPS: false,
    showPreview: false,
  },
  {
    id: 'wallet',
    name: 'Wallet Scan',
    description: 'Auto-open crypto wallets',
    icon: 'account-balance-wallet',
    color: '#FFD700',
    autoCopy: false,
    autoOpen: true,
    autoArchive: true,
    addGPS: false,
    showPreview: false,
  },
  {
    id: 'legacy',
    name: 'Legacy Scan',
    description: 'Archive + export ready',
    icon: 'archive',
    color: '#4CAF50',
    autoCopy: false,
    autoOpen: false,
    autoArchive: true,
    addGPS: true,
    showPreview: true,
  },
  {
    id: 'artifact',
    name: 'Artifact Scan',
    description: 'Full provenance capture',
    icon: 'inventory',
    color: '#FF6F00',
    autoCopy: false,
    autoOpen: false,
    autoArchive: true,
    addGPS: true,
    showPreview: true,
  },
];
