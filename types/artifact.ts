export interface ArtifactMetadata {
  id: string; // Unique hash-based ID
  name: string;
  type: ArtifactType;
  material?: string;
  estimatedAge?: string;
  condition?: ArtifactCondition;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit: 'cm' | 'mm' | 'in' | 'g' | 'kg' | 'oz';
  };
  provenance: ProvenanceData;
  appraisal: AppraisalNotes;
  legal: LegalCompliance;
  media: MediaData;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProvenanceData {
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    site?: string;
  };
  discoveryDate?: number;
  discoveredBy?: string;
  context?: string; // Archaeological context
  chain?: ProvenanceChainEntry[]; // Chain of custody
}

export interface ProvenanceChainEntry {
  date: number;
  custodian: string;
  action: 'discovered' | 'transferred' | 'examined' | 'restored' | 'cataloged';
  notes?: string;
}

export interface AppraisalNotes {
  description?: string;
  culturalPeriod?: string;
  significance?: string;
  authenticity?: 'verified' | 'probable' | 'uncertain' | 'replica';
  appraiser?: string;
  appraisalDate?: number;
  estimatedValue?: {
    amount?: number;
    currency?: string;
    confidence?: 'low' | 'medium' | 'high';
  };
}

export interface LegalCompliance {
  ownership: 'personal' | 'institutional' | 'public' | 'restricted';
  acquisitionMethod?: 'excavation' | 'purchase' | 'donation' | 'inheritance' | 'found';
  permit?: string;
  restrictions?: string[];
  preservationStatus?: 'protected' | 'monitored' | 'unrestricted';
  exportRestrictions?: boolean;
}

export interface MediaData {
  primaryImage?: string; // Base64 compressed
  additionalImages?: string[];
  imageCount: number;
  captureDate?: number;
}

export type ArtifactType = 
  | 'stone-tool'
  | 'pottery'
  | 'bone'
  | 'metal'
  | 'textile'
  | 'wood'
  | 'glass'
  | 'document'
  | 'fossil'
  | 'coin'
  | 'jewelry'
  | 'weapon'
  | 'tool'
  | 'art'
  | 'other';

export type ArtifactCondition = 
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'fragmentary';

export interface ExportFormat {
  type: 'pdf' | 'csv' | 'json' | 'vcard';
  includeImages: boolean;
  includeMetadata: boolean;
}

export const ARTIFACT_TYPES: { value: ArtifactType; label: string; icon: string }[] = [
  { value: 'stone-tool', label: 'Stone Tool', icon: 'construction' },
  { value: 'pottery', label: 'Pottery/Ceramic', icon: 'local-dining' },
  { value: 'bone', label: 'Bone/Ivory', icon: 'pets' },
  { value: 'metal', label: 'Metal Object', icon: 'hardware' },
  { value: 'textile', label: 'Textile', icon: 'checkroom' },
  { value: 'wood', label: 'Wood', icon: 'park' },
  { value: 'glass', label: 'Glass', icon: 'wine-bar' },
  { value: 'document', label: 'Document', icon: 'description' },
  { value: 'fossil', label: 'Fossil', icon: 'bug-report' },
  { value: 'coin', label: 'Coin/Currency', icon: 'paid' },
  { value: 'jewelry', label: 'Jewelry', icon: 'diamond' },
  { value: 'weapon', label: 'Weapon', icon: 'shield' },
  { value: 'tool', label: 'Tool', icon: 'build' },
  { value: 'art', label: 'Art Object', icon: 'palette' },
  { value: 'other', label: 'Other', icon: 'category' },
];

export const OWNERSHIP_TYPES = [
  { value: 'personal' as const, label: 'Personal Collection' },
  { value: 'institutional' as const, label: 'Institutional' },
  { value: 'public' as const, label: 'Public Domain' },
  { value: 'restricted' as const, label: 'Restricted' },
];

export const ACQUISITION_METHODS = [
  { value: 'excavation' as const, label: 'Archaeological Excavation' },
  { value: 'purchase' as const, label: 'Purchase' },
  { value: 'donation' as const, label: 'Donation' },
  { value: 'inheritance' as const, label: 'Inheritance' },
  { value: 'found' as const, label: 'Found/Surface Collection' },
];

export const CONDITION_LEVELS = [
  { value: 'excellent' as const, label: 'Excellent', color: '#4CAF50' },
  { value: 'good' as const, label: 'Good', color: '#8BC34A' },
  { value: 'fair' as const, label: 'Fair', color: '#FFC107' },
  { value: 'poor' as const, label: 'Poor', color: '#FF9800' },
  { value: 'fragmentary' as const, label: 'Fragmentary', color: '#FF5722' },
];

export const AUTHENTICITY_LEVELS = [
  { value: 'verified' as const, label: 'Verified Authentic' },
  { value: 'probable' as const, label: 'Probably Authentic' },
  { value: 'uncertain' as const, label: 'Uncertain' },
  { value: 'replica' as const, label: 'Replica/Copy' },
];
