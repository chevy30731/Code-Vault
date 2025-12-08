import * as Crypto from 'expo-crypto';
import type { ArtifactMetadata } from '@/types/artifact';

export const artifactService = {
  async generateArtifactId(artifact: Partial<ArtifactMetadata>): Promise<string> {
    const dataString = JSON.stringify({
      name: artifact.name,
      type: artifact.type,
      timestamp: artifact.createdAt || Date.now(),
      location: artifact.provenance?.location,
    });
    
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString
    );
    
    return `ART-${hash.substring(0, 12).toUpperCase()}`;
  },

  encodeArtifactQR(artifact: ArtifactMetadata): string {
    const qrData = {
      v: '1.0', // Version
      id: artifact.id,
      name: artifact.name,
      type: artifact.type,
      material: artifact.material,
      age: artifact.estimatedAge,
      condition: artifact.appraisal.authenticity,
      provenance: {
        lat: artifact.provenance.location?.latitude,
        lng: artifact.provenance.location?.longitude,
        site: artifact.provenance.location?.site,
        date: artifact.provenance.discoveryDate,
        by: artifact.provenance.discoveredBy,
      },
      legal: {
        ownership: artifact.legal.ownership,
        status: artifact.legal.preservationStatus,
      },
      image: artifact.media.primaryImage?.substring(0, 500), // Compressed preview
      notes: artifact.notes?.substring(0, 200),
      created: artifact.createdAt,
    };

    return `CODEVAULT_ARTIFACT:${JSON.stringify(qrData)}`;
  },

  decodeArtifactQR(qrData: string): Partial<ArtifactMetadata> | null {
    try {
      if (!qrData.startsWith('CODEVAULT_ARTIFACT:')) {
        return null;
      }

      const jsonData = qrData.replace('CODEVAULT_ARTIFACT:', '');
      const parsed = JSON.parse(jsonData);

      return {
        id: parsed.id,
        name: parsed.name,
        type: parsed.type,
        material: parsed.material,
        estimatedAge: parsed.age,
        provenance: {
          location: {
            latitude: parsed.provenance?.lat,
            longitude: parsed.provenance?.lng,
            site: parsed.provenance?.site,
          },
          discoveryDate: parsed.provenance?.date,
          discoveredBy: parsed.provenance?.by,
        },
        appraisal: {
          authenticity: parsed.condition,
        },
        legal: {
          ownership: parsed.legal?.ownership || 'personal',
          preservationStatus: parsed.legal?.status,
        },
        media: {
          primaryImage: parsed.image,
          imageCount: parsed.image ? 1 : 0,
        },
        notes: parsed.notes,
        createdAt: parsed.created,
        updatedAt: Date.now(),
      };
    } catch (error) {
      console.error('Error decoding artifact QR:', error);
      return null;
    }
  },

  validateArtifact(artifact: Partial<ArtifactMetadata>): string[] {
    const errors: string[] = [];

    if (!artifact.name?.trim()) {
      errors.push('Artifact name is required');
    }

    if (!artifact.type) {
      errors.push('Artifact type is required');
    }

    if (!artifact.legal?.ownership) {
      errors.push('Ownership information is required');
    }

    return errors;
  },

  searchArtifacts(
    artifacts: ArtifactMetadata[],
    query: string
  ): ArtifactMetadata[] {
    const lowerQuery = query.toLowerCase();

    return artifacts.filter((artifact) => {
      return (
        artifact.name.toLowerCase().includes(lowerQuery) ||
        artifact.type.toLowerCase().includes(lowerQuery) ||
        artifact.material?.toLowerCase().includes(lowerQuery) ||
        artifact.notes?.toLowerCase().includes(lowerQuery) ||
        artifact.provenance.location?.site?.toLowerCase().includes(lowerQuery) ||
        artifact.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  },

  filterByType(
    artifacts: ArtifactMetadata[],
    type: string
  ): ArtifactMetadata[] {
    return artifacts.filter((artifact) => artifact.type === type);
  },

  sortArtifacts(
    artifacts: ArtifactMetadata[],
    sortBy: 'name' | 'date' | 'type'
  ): ArtifactMetadata[] {
    return [...artifacts].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.createdAt - a.createdAt;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  },
};
