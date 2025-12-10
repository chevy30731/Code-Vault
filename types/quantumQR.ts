export type QuantumLayerType = 'public' | 'private' | 'hidden';

export interface QuantumLayer {
  id: string;
  type: QuantumLayerType;
  name: string;
  data: string;
  encrypted: boolean;
  requiresAuth?: boolean; // PIN/biometric for private, developer mode for hidden
  description?: string;
}

export interface QuantumQRCode {
  id: string;
  version: string; // '1.0'
  name: string;
  layers: QuantumLayer[];
  createdAt: number;
  updatedAt: number;
  category?: string;
  tags?: string[];
  expiration?: {
    type: 'time' | 'scans' | 'both';
    expiresAt?: number; // Unix timestamp
    maxScans?: number;
    currentScans?: number;
  };
  watermark?: string;
}

export interface QuantumLayerConfig {
  type: QuantumLayerType;
  name: string;
  data: string;
  description?: string;
  unlockAfterScans?: number;
}

export interface UnlockedLayer extends QuantumLayer {
  decryptedData?: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const LAYER_TYPES = [
  {
    type: 'public' as QuantumLayerType,
    label: 'Public Layer',
    description: 'Visible to anyone who scans',
    icon: 'public',
    color: '#00D9FF',
    requiresAuth: false,
  },
  {
    type: 'private' as QuantumLayerType,
    label: 'Private Layer',
    description: 'Requires PIN/biometric to unlock',
    icon: 'lock',
    color: '#FFD700',
    requiresAuth: true,
  },
  {
    type: 'hidden' as QuantumLayerType,
    label: 'Hidden Layer',
    description: 'Developer/debug mode only',
    icon: 'lock-outline',
    color: '#FF4444',
    requiresAuth: true,
  },
];

export const QUANTUM_QR_PREFIX = 'CODEVAULT_QUANTUM:';
