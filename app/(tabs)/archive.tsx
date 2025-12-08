import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { storageService } from '@/services/storage';
import { artifactService } from '@/services/artifact';
import { exportService } from '@/services/export';
import { qrImageService } from '@/services/qrImage';
import { QRDisplay } from '@/components/QRDisplay';
import type { ArtifactMetadata } from '@/types/artifact';
import { ARTIFACT_TYPES } from '@/types/artifact';

export default function ArchiveScreen() {
  const [artifacts, setArtifacts] = useState<ArtifactMetadata[]>([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState<ArtifactMetadata[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactMetadata | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('date');
  const [exporting, setExporting] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    loadArtifacts();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [artifacts, searchQuery, selectedType, sortBy]);

  const loadArtifacts = async () => {
    const data = await storageService.getArtifacts();
    setArtifacts(data);
  };

  const filterAndSort = () => {
    let filtered = [...artifacts];

    if (searchQuery) {
      filtered = artifactService.searchArtifacts(filtered, searchQuery);
    }

    if (selectedType) {
      filtered = artifactService.filterByType(filtered, selectedType);
    }

    filtered = artifactService.sortArtifacts(filtered, sortBy);

    setFilteredArtifacts(filtered);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Artifact',
      'Are you sure you want to remove this artifact from the archive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteArtifact(id);
            loadArtifacts();
            setSelectedArtifact(null);
          },
        },
      ]
    );
  };

  const handleGenerateQR = (artifact: ArtifactMetadata) => {
    setSelectedArtifact(artifact);
    setShowQR(true);
  };

  const handleExport = async () => {
    if (filteredArtifacts.length === 0) {
      Alert.alert('No Data', 'No artifacts to export');
      return;
    }

    Alert.alert(
      'Export Format',
      'Choose export format',
      [
        {
          text: 'JSON (Full Data)',
          onPress: async () => {
            setExporting(true);
            try {
              const filePath = await exportService.exportToJSON(filteredArtifacts, true);
              await exportService.shareExport(filePath, 'application/json');
            } catch (error) {
              Alert.alert('Error', 'Failed to export');
            } finally {
              setExporting(false);
            }
          },
        },
        {
          text: 'CSV (Spreadsheet)',
          onPress: async () => {
            setExporting(true);
            try {
              const filePath = await exportService.exportToCSV(filteredArtifacts);
              await exportService.shareExport(filePath, 'text/csv');
            } catch (error) {
              Alert.alert('Error', 'Failed to export');
            } finally {
              setExporting(false);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderArtifactItem = ({ item }: { item: ArtifactMetadata }) => {
    const artifactType = ARTIFACT_TYPES.find((t) => t.value === item.type);

    return (
      <TouchableOpacity
        style={styles.artifactCard}
        onPress={() => setSelectedArtifact(item)}
      >
        {item.media.primaryImage && (
          <Image
            source={{ uri: item.media.primaryImage }}
            style={styles.artifactImage}
          />
        )}
        <View style={styles.artifactContent}>
          <View style={styles.artifactHeader}>
            <View style={styles.artifactInfo}>
              {artifactType && (
                <MaterialIcons
                  name={artifactType.icon as any}
                  size={20}
                  color="#00D9FF"
                />
              )}
              <Text style={styles.artifactName}>{item.name}</Text>
            </View>
            <Text style={styles.artifactId}>{item.id}</Text>
          </View>
          <View style={styles.artifactMeta}>
            <Text style={styles.artifactMetaText}>
              {artifactType?.label || item.type}
            </Text>
            {item.estimatedAge && (
              <>
                <Text style={styles.artifactMetaDot}>•</Text>
                <Text style={styles.artifactMetaText}>{item.estimatedAge}</Text>
              </>
            )}
          </View>
          {item.provenance.location?.site && (
            <View style={styles.artifactLocation}>
              <MaterialIcons name="place" size={14} color="#666666" />
              <Text style={styles.artifactLocationText}>
                {item.provenance.location.site}
              </Text>
            </View>
          )}
          <Text style={styles.artifactDate}>
            Cataloged: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="folder-open" size={32} color="#00D9FF" />
            <Text style={styles.headerTitle}>Archive</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
              <MaterialIcons
                name={exporting ? 'hourglass-empty' : 'share'}
                size={24}
                color="#00D9FF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/(tabs)/capture')}
            >
              <MaterialIcons name="add" size={24} color="#00D9FF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artifacts..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedType === null && styles.filterChipActive]}
            onPress={() => setSelectedType(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedType === null && styles.filterChipTextActive,
              ]}
            >
              All ({artifacts.length})
            </Text>
          </TouchableOpacity>
          {ARTIFACT_TYPES.slice(0, 8).map((type) => {
            const count = artifacts.filter((a) => a.type === type.value).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterChip,
                  selectedType === type.value && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <MaterialIcons
                  name={type.icon as any}
                  size={14}
                  color={selectedType === type.value ? '#000000' : '#00D9FF'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedType === type.value && styles.filterChipTextActive,
                  ]}
                >
                  {type.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filteredArtifacts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="inventory" size={64} color="#666666" />
          <Text style={styles.emptyTitle}>No Artifacts</Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedType
              ? 'No artifacts match your search criteria.'
              : 'Start capturing artifacts to build your archive.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/capture')}
          >
            <MaterialIcons name="photo-camera" size={20} color="#000000" />
            <Text style={styles.emptyButtonText}>Capture Artifact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredArtifacts}
          renderItem={renderArtifactItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={selectedArtifact !== null && !showQR} animationType="slide">
        {selectedArtifact && (
          <View style={styles.detailContainer}>
            <ScrollView
              style={styles.detailScroll}
              contentContainerStyle={[styles.detailContent, { paddingTop: insets.top }]}
            >
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{selectedArtifact.name}</Text>
                <TouchableOpacity onPress={() => setSelectedArtifact(null)}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {selectedArtifact.media.primaryImage && (
                <Image
                  source={{ uri: selectedArtifact.media.primaryImage }}
                  style={styles.detailImage}
                />
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Identification</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{selectedArtifact.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>
                    {ARTIFACT_TYPES.find((t) => t.value === selectedArtifact.type)?.label}
                  </Text>
                </View>
                {selectedArtifact.material && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Material:</Text>
                    <Text style={styles.detailValue}>{selectedArtifact.material}</Text>
                  </View>
                )}
                {selectedArtifact.estimatedAge && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Age:</Text>
                    <Text style={styles.detailValue}>{selectedArtifact.estimatedAge}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Provenance</Text>
                {selectedArtifact.provenance.location?.site && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Site:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArtifact.provenance.location.site}
                    </Text>
                  </View>
                )}
                {selectedArtifact.provenance.discoveryDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Discovery Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedArtifact.provenance.discoveryDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {selectedArtifact.provenance.discoveredBy && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Discovered By:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArtifact.provenance.discoveredBy}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Legal</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ownership:</Text>
                  <Text style={styles.detailValue}>{selectedArtifact.legal.ownership}</Text>
                </View>
                {selectedArtifact.legal.acquisitionMethod && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Acquisition:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArtifact.legal.acquisitionMethod}
                    </Text>
                  </View>
                )}
              </View>

              {selectedArtifact.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <Text style={styles.detailNotes}>{selectedArtifact.notes}</Text>
                </View>
              )}

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => handleGenerateQR(selectedArtifact)}
                >
                  <MaterialIcons name="qr-code" size={20} color="#000000" />
                  <Text style={styles.qrButtonText}>Generate QR Tag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButtonDetail}
                  onPress={() => handleDelete(selectedArtifact.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal visible={showQR && selectedArtifact !== null} animationType="slide">
        {selectedArtifact && (
          <QRDisplay
            data={artifactService.encodeArtifactQR(selectedArtifact)}
            title={`${selectedArtifact.name} - Provenance Tag`}
            color="#000000"
            backgroundColor="#FFFFFF"
            onClose={() => {
              setShowQR(false);
              setSelectedArtifact(null);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0F0F1E',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#00D9FF33',
    gap: 4,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  artifactCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  artifactImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  artifactContent: {
    padding: 16,
  },
  artifactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  artifactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  artifactName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  artifactId: {
    fontSize: 12,
    color: '#00D9FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  artifactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  artifactMetaText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  artifactMetaDot: {
    fontSize: 14,
    color: '#666666',
  },
  artifactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  artifactLocationText: {
    fontSize: 12,
    color: '#666666',
  },
  artifactDate: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D9FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  detailScroll: {
    flex: 1,
  },
  detailContent: {
    paddingBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  detailSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9FF',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    width: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  detailNotes: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  detailActions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D9FF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  deleteButtonDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF444433',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4444',
  },
});
