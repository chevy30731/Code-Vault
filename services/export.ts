import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ArtifactMetadata, ExportFormat } from '@/types/artifact';

export const exportService = {
  async exportToJSON(
    artifacts: ArtifactMetadata[],
    includeImages: boolean = true
  ): Promise<string> {
    const exportData = artifacts.map((artifact) => {
      if (!includeImages) {
        const { media, ...rest } = artifact;
        return { ...rest, media: { imageCount: media.imageCount } };
      }
      return artifact;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `artifacts_export_${Date.now()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString);
    return filePath;
  },

  async exportToCSV(artifacts: ArtifactMetadata[]): Promise<string> {
    const headers = [
      'ID',
      'Name',
      'Type',
      'Material',
      'Estimated Age',
      'Condition',
      'Discovery Site',
      'Discovery Date',
      'Discovered By',
      'Ownership',
      'Preservation Status',
      'Notes',
      'Created',
    ];

    const rows = artifacts.map((artifact) => [
      artifact.id,
      artifact.name,
      artifact.type,
      artifact.material || '',
      artifact.estimatedAge || '',
      artifact.condition || '',
      artifact.provenance.location?.site || '',
      artifact.provenance.discoveryDate
        ? new Date(artifact.provenance.discoveryDate).toLocaleDateString()
        : '',
      artifact.provenance.discoveredBy || '',
      artifact.legal.ownership,
      artifact.legal.preservationStatus || '',
      artifact.notes || '',
      new Date(artifact.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const fileName = `artifacts_export_${Date.now()}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);
    return filePath;
  },

  async exportToVCard(artifact: ArtifactMetadata): Promise<string> {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${artifact.name}`,
      `TITLE:${artifact.type}`,
      `ORG:${artifact.provenance.location?.site || 'Unknown Site'}`,
      `NOTE:ID: ${artifact.id}\\nMaterial: ${artifact.material || 'N/A'}\\nAge: ${artifact.estimatedAge || 'N/A'}\\n${artifact.notes || ''}`,
      artifact.provenance.location?.latitude && artifact.provenance.location?.longitude
        ? `GEO:${artifact.provenance.location.latitude},${artifact.provenance.location.longitude}`
        : '',
      `REV:${new Date(artifact.updatedAt).toISOString()}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');

    const fileName = `${artifact.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.vcf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, vcard);
    return filePath;
  },

  async shareExport(filePath: string, mimeType: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Sharing is not available');
        return false;
      }

      await Sharing.shareAsync(filePath, {
        mimeType,
        dialogTitle: 'Export Artifacts',
      });

      return true;
    } catch (error) {
      console.error('Error sharing export:', error);
      return false;
    }
  },
};
