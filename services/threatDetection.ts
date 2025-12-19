import type { ThreatLevel } from '@/types/scanLog';

const PHISHING_PATTERNS = [
  /bit\.ly|tinyurl|goo\.gl/i,
  /paypal.*verify/i,
  /bank.*account.*suspend/i,
  /click.*here.*prize/i,
  /urgent.*action.*required/i,
];

const MALWARE_PATTERNS = [
  /\.exe|\.apk|\.dmg/i,
  /download.*crack/i,
  /free.*premium/i,
];

export const threatDetectionService = {
  analyzeThreat(data: string): ThreatLevel {
    const lowerData = data.toLowerCase();

    // Check for malware patterns (highest threat)
    for (const pattern of MALWARE_PATTERNS) {
      if (pattern.test(lowerData)) {
        return 'danger';
      }
    }

    // Check for phishing patterns
    for (const pattern of PHISHING_PATTERNS) {
      if (pattern.test(lowerData)) {
        return 'warning';
      }
    }

    // Check for suspicious URL shorteners
    if (this.isShortURL(data)) {
      return 'warning';
    }

    return 'safe';
  },

  isShortURL(url: string): boolean {
    const shortDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly'];
    return shortDomains.some((domain) => url.includes(domain));
  },

  getThreatColor(level: ThreatLevel): string {
    switch (level) {
      case 'safe':
        return '#4CAF50';
      case 'warning':
        return '#FFD700';
      case 'danger':
        return '#FF4444';
    }
  },

  getThreatIcon(level: ThreatLevel): string {
    switch (level) {
      case 'safe':
        return 'check-circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
    }
  },

  getThreatMessage(level: ThreatLevel): string {
    switch (level) {
      case 'safe':
        return 'No threats detected';
      case 'warning':
        return 'Potentially suspicious content';
      case 'danger':
        return 'High risk - proceed with caution';
    }
  },
};
