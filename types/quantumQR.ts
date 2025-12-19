export type LayerType = 'public' | 'private' | 'hidden';

export interface QuantumLayer {
  id: string;
  type: LayerType;
  name: string;
  data: string;
  description?: string;
  scanLimit?: number;
  scanCount: number;
  expiresAt?: number;
  createdAt: number;
}

export interface QuantumQRCode {
  id: string;
  name: string;
  layers: QuantumLayer[];
  createdAt: number;
}

export interface UnlockedLayer extends QuantumLayer {
  unlocked: boolean;
  decryptedData?: string;
  unlockedAt?: number;
}

export interface LayerTypeInfo {
  type: LayerType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const LAYER_TYPES: LayerTypeInfo[] = [
  {
    type: 'public',
    label: 'Public',
    icon: 'public',
    color: '#00D9FF',
    description: 'Visible to everyone',
  },
  {
    type: 'private',
    label: 'Private',
    icon: 'lock',
    color: '#FFD700',
    description: 'Requires PIN to unlock',
  },
  {
    type: 'hidden',
    label: 'Hidden',
    icon: 'visibility-off',
    color: '#FF4444',
    description: 'Developer mode only',
  },
];
