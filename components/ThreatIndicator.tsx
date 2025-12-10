import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ScanLog } from '@/types/scanLog';
import { threatDetectionService } from '@/services/threatDetection';

interface ThreatIndicatorProps {
  threatLevel: ScanLog['threatLevel'];
  showDetails?: boolean;
}

export function ThreatIndicator({ threatLevel, showDetails = false }: ThreatIndicatorProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (threatLevel === 'danger') {
      // Pulsing animation for danger
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [threatLevel]);

  const color = threatDetectionService.getThreatColor(threatLevel);
  const icon = threatDetectionService.getThreatIcon(threatLevel);
  const message = threatDetectionService.getThreatMessage(threatLevel);

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <MaterialIcons name={icon as any} size={20} color={color} />
      </Animated.View>
      <View style={styles.content}>
        <Text style={[styles.level, { color }]}>
          {threatLevel.toUpperCase()}
        </Text>
        {showDetails && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  level: {
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 2,
    lineHeight: 14,
  },
});
