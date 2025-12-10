import type { ScanLog } from '@/types/scanLog';

const PHISHING_PATTERNS = [
  /bit\.ly/i,
  /tinyurl/i,
  /goo\.gl/i,
  /ow\.ly/i,
  /t\.co/i,
  /buff\.ly/i,
  /adf\.ly/i,
  /is\.gd/i,
  /soo\.gd/i,
  /s2r\.co/i,
  /clicky\.me/i,
  /budurl\.com/i,
  /bc\.vc/i,
];

const SUSPICIOUS_KEYWORDS = [
  'verify',
  'urgent',
  'suspended',
  'confirm',
  'click here',
  'act now',
  'winner',
  'congratulations',
  'prize',
  'free',
  'bitcoin',
  'wallet',
  'login',
  'password',
  'update payment',
  'account locked',
];

export const threatDetectionService = {
  analyzeThreat(data: string, type: string): ScanLog['threatLevel'] {
    // Encrypted and Quantum QRs are considered safe by default
    if (type === 'encrypted' || type === 'quantum') {
      return 'safe';
    }

    let threatScore = 0;

    // Check for URL shorteners (phishing risk)
    if (PHISHING_PATTERNS.some((pattern) => pattern.test(data))) {
      threatScore += 3;
    }

    // Check for suspicious keywords
    const lowerData = data.toLowerCase();
    const suspiciousCount = SUSPICIOUS_KEYWORDS.filter((keyword) =>
      lowerData.includes(keyword)
    ).length;
    threatScore += suspiciousCount;

    // Check for IP addresses (suspicious)
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(data)) {
      threatScore += 2;
    }

    // Check for excessive parameters (data harvesting)
    const paramCount = (data.match(/[?&]/g) || []).length;
    if (paramCount > 5) {
      threatScore += 2;
    }

    // Determine threat level
    if (threatScore >= 5) return 'danger';
    if (threatScore >= 2) return 'warning';
    return 'safe';
  },

  getThreatMessage(level: ScanLog['threatLevel']): string {
    switch (level) {
      case 'danger':
        return '⚠️ HIGH RISK - This QR code shows signs of phishing or malware. Do not proceed.';
      case 'warning':
        return '⚠️ CAUTION - This QR code has suspicious characteristics. Verify before opening.';
      case 'safe':
        return '✓ SAFE - No threats detected';
    }
  },

  getThreatColor(level: ScanLog['threatLevel']): string {
    switch (level) {
      case 'danger':
        return '#FF4444';
      case 'warning':
        return '#FFD700';
      case 'safe':
        return '#4CAF50';
    }
  },

  getThreatIcon(level: ScanLog['threatLevel']): string {
    switch (level) {
      case 'danger':
        return 'dangerous';
      case 'warning':
        return 'warning';
      case 'safe':
        return 'verified-user';
    }
  },
};
