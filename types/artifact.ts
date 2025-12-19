export interface Artifact {
  id: string;
  scanLogId: string;
  title: string;
  description: string;
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  createdAt: number;
  updatedAt: number;
}

export type ArtifactType =
  | 'pottery'
  | 'tool'
  | 'weapon'
  | 'jewelry'
  | 'coin'
  | 'manuscript'
  | 'sculpture'
  | 'furniture'
  | 'textile'
  | 'bone'
  | 'metal'
  | 'glass'
  | 'stone'
  | 'other';

export interface ArtifactTypeInfo {
  value: ArtifactType;
  label: string;
  icon: string;
  color: string;
}

export const ARTIFACT_TYPES: ArtifactTypeInfo[] = [
  { value: 'pottery', label: 'Pottery', icon: 'brightness-1', color: '#FFD700' },
  { value: 'tool', label: 'Tool', icon: 'build', color: '#00D9FF' },
  { value: 'weapon', label: 'Weapon', icon: 'gavel', color: '#FF4444' },
  { value: 'jewelry', label: 'Jewelry', icon: 'star', color: '#9C27B0' },
  { value: 'coin', label: 'Coin', icon: 'monetization-on', color: '#FFD700' },
  { value: 'manuscript', label: 'Manuscript', icon: 'description', color: '#4CAF50' },
  { value: 'sculpture', label: 'Sculpture', icon: 'format-shapes', color: '#FF9800' },
  { value: 'furniture', label: 'Furniture', icon: 'weekend', color: '#795548' },
  { value: 'textile', label: 'Textile', icon: 'layers', color: '#E91E63' },
  { value: 'bone', label: 'Bone/Fossil', icon: 'pets', color: '#9E9E9E' },
  { value: 'metal', label: 'Metal Object', icon: 'gradient', color: '#607D8B' },
  { value: 'glass', label: 'Glass', icon: 'wb-sunny', color: '#00BCD4' },
  { value: 'stone', label: 'Stone/Rock', icon: 'terrain', color: '#8D6E63' },
  { value: 'other', label: 'Other', icon: 'category', color: '#666666' },
];

export interface ProvenanceLocation {
  latitude?: number;
  longitude?: number;
  site?: string;
  region?: string;
  country?: string;
}

export interface Provenance {
  location?: ProvenanceLocation;
  discoveryDate?: number;
  discoveredBy?: string;
  excavationSite?: string;
  custody: string[];
}

export interface Appraisal {
  authenticity?: 'verified' | 'probable' | 'uncertain';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue?: string;
}

export interface Legal {
  ownership: string;
  acquisitionMethod?: string;
  exportPermits?: string[];
  preservationStatus?: string;
}

export interface Media {
  primaryImage?: string;
  additionalImages?: string[];
  imageCount: number;
}

export interface ArtifactMetadata {
  id: string;
  name: string;
  type: ArtifactType;
  material?: string;
  estimatedAge?: string;
  provenance: Provenance;
  appraisal: Appraisal;
  legal: Legal;
  media: Media;
  tags?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
