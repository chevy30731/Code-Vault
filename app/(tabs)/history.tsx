import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scanLogService } from '@/services/scanLog';
import { threatDetectionService } from '@/services/threatDetection';
import { ThreatIndicator } from '@/components/ThreatIndicator';
import type { ScanLog, ScanProfile } from '@/types/scanLog';
import { SCAN_PROFILES } from '@/types/scanLog';

type FilterType = 'all' | ScanLog['type'] | ScanLog['threatLevel'];

export default function HistoryScreen() {
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ScanLog[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedProfile, setSelectedProfile] = useState<ScanProfile | 'all'>('all');
  const [selectedLog, setSelectedLog] = useState<ScanLog | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [scanLogs, selectedFilter, selectedProfile]);

  const loadLogs = async () => {
    const logs = await scanLogService.getScanLogs();
    setScanLogs(logs);
  };

  const applyFilters = () => {
    let filtered = [...scanLogs];

    if (selectedFilter !== 'all') {
      if (['safe', 'warning', 'danger'].includes(selectedFilter)) {
        filtered = filtered.filter((log) => log.threatLevel === selectedFilter);
      } else {
        filtered = filtered.filter((log) => log.type === selectedFilter);
      }
    }

    if (selectedProfile !== 'all') {
      filtered = filtered.filter((log) => log.profile === selectedProfile);
    }

    setFilteredLogs(filtered);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Scan Log',
      'Remove this scan from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await scanLogService.deleteScanLog(id);
            loadLogs();
            setSelectedLog(null);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Logs',
      'This will permanently delete all scan logs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await scanLogService.clearAllLogs();
            loadLogs();
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    Alert.alert(
      'Export Scan Logs',
      'Choose export options',
      [
        {
          text: 'Standard (JSON)',
          onPress: async () => {
            const content = await scanLogService.exportLogs(false);
            Alert.alert('Export Ready', 'Scan logs exported to JSON');
          },
        },
        {
          text: 'Encrypted',
          onPress: async () => {
            Alert.prompt(
              'Encryption Password',
              'Enter password to encrypt export',
              async (password) => {
                if (password) {
                  const content = await scanLogService.exportLogs(true, password);
                  Alert.alert('Export Ready', 'Encrypted scan logs exported');
                }
              },
              'secure-text'
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderLogItem = ({ item }: { item: ScanLog }) => {
    const profile = SCAN_PROFILES.find((p) => p.id === item.profile);
    const color = threatDetectionService.getThreatColor(item.threatLevel);

    return (
      <TouchableOpacity
        style={[styles.logCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
        onPress={() => setSelectedLog(item)}
      >
        <View style={styles.logHeader}>
          <View style={styles.logType}>
            <MaterialIcons 
              name={profile?.icon as any || 'qr-code-scanner'} 
              size={20} 
              color={profile?.color || '#00D9FF'} 
            />
            <Text style={styles.logTypeText}>{item.type.toUpperCase()}</Text>
          </View>
          <ThreatIndicator threatLevel={item.threatLevel} />
        </View>

        <Text style={styles.logData} numberOfLines={2}>
          {item.data}
        </Text>

        <View style={styles.logMeta}>
          <Text style={styles.logMetaText}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          {item.location && (
            <View style={styles.logLocation}>
              <MaterialIcons name="location-on" size={12} color="#00D9FF" />
              <Text style={styles.logLocationText}>GPS</Text>
            </View>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.logTags}>
              <MaterialIcons name="label" size={12} color="#9C27B0" />
              <Text style={styles.logTagsText}>{item.tags.length} tags</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="history" size={32} color="#00D9FF" />
            <Text style={styles.headerTitle}>Scan History</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
              <MaterialIcons name="download" size={24} color="#00D9FF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleClearAll}>
              <MaterialIcons name="delete-sweep" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{scanLogs.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {scanLogs.filter((l) => l.threatLevel === 'safe').length}
            </Text>
            <Text style={styles.statLabel}>Safe</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>
              {scanLogs.filter((l) => l.threatLevel === 'warning').length}
            </Text>
            <Text style={styles.statLabel}>Warning</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF4444' }]}>
              {scanLogs.filter((l) => l.threatLevel === 'danger').length}
            </Text>
            <Text style={styles.statLabel}>Danger</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'safe' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('safe')}
          >
            <MaterialIcons name="verified-user" size={14} color={selectedFilter === 'safe' ? '#000000' : '#4CAF50'} />
            <Text style={[styles.filterChipText, selectedFilter === 'safe' && styles.filterChipTextActive]}>
              Safe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'warning' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('warning')}
          >
            <MaterialIcons name="warning" size={14} color={selectedFilter === 'warning' ? '#000000' : '#FFD700'} />
            <Text style={[styles.filterChipText, selectedFilter === 'warning' && styles.filterChipTextActive]}>
              Warning
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'danger' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('danger')}
          >
            <MaterialIcons name="dangerous" size={14} color={selectedFilter === 'danger' ? '#000000' : '#FF4444'} />
            <Text style={[styles.filterChipText, selectedFilter === 'danger' && styles.filterChipTextActive]}>
              Danger
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          {SCAN_PROFILES.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={[styles.filterChip, selectedProfile === profile.id && styles.filterChipActive]}
              onPress={() => setSelectedProfile(selectedProfile === profile.id ? 'all' : profile.id)}
            >
              <MaterialIcons 
                name={profile.icon as any} 
                size={14} 
                color={selectedProfile === profile.id ? '#000000' : profile.color} 
              />
              <Text style={[styles.filterChipText, selectedProfile === profile.id && styles.filterChipTextActive]}>
                {profile.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="history" size={64} color="#666666" />
          <Text style={styles.emptyTitle}>No Scan Logs</Text>
          <Text style={styles.emptyText}>
            {selectedFilter !== 'all' || selectedProfile !== 'all'
              ? 'No scans match the selected filters'
              : 'Start scanning QR codes to build your history'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D9FF',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  filterRow: {
    maxHeight: 40,
  },
  filterContent: {
    gap: 8,
    paddingRight: 20,
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
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#666666',
    alignSelf: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  logCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF33',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D9FF',
  },
  logData: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  logMetaText: {
    fontSize: 11,
    color: '#666666',
  },
  logLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logLocationText: {
    fontSize: 11,
    color: '#00D9FF',
  },
  logTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTagsText: {
    fontSize: 11,
    color: '#9C27B0',
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
  },
});
