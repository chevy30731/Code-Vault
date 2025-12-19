import type { QRCategory } from '@/types/qr';

export const qrService = {
  formatData(category: QRCategory, input: string): string {
    switch (category) {
      case 'url':
        return input.startsWith('http') ? input : `https://${input}`;
      
      case 'email':
        return `mailto:${input}`;
      
      case 'sms':
        return `sms:${input}`;
      
      case 'phone':
        return `tel:${input}`;
      
      case 'wallet':
        return `crypto:${input}`;
      
      case 'wifi':
        // Format: WIFI:T:WPA;S:SSID;P:password;;
        const [ssid, password, type = 'WPA'] = input.split(';');
        return `WIFI:T:${type};S:${ssid};P:${password};;`;
      
      case 'location':
        // Format: geo:latitude,longitude
        return `geo:${input}`;
      
      case 'contact':
        // Simple vCard format
        const [name, phone, email] = input.split(';');
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      
      case 'text':
      case 'encrypted':
      default:
        return input;
    }
  },

  parseQRData(data: string): { type: string; content: string } {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return { type: 'URL', content: data };
    }
    if (data.startsWith('mailto:')) {
      return { type: 'Email', content: data.replace('mailto:', '') };
    }
    if (data.startsWith('tel:')) {
      return { type: 'Phone', content: data.replace('tel:', '') };
    }
    if (data.startsWith('sms:')) {
      return { type: 'SMS', content: data.replace('sms:', '') };
    }
    if (data.startsWith('geo:')) {
      return { type: 'Location', content: data.replace('geo:', '') };
    }
    if (data.startsWith('WIFI:')) {
      return { type: 'WiFi', content: data };
    }
    if (data.startsWith('BEGIN:VCARD')) {
      return { type: 'Contact', content: data };
    }
    if (data.startsWith('crypto:')) {
      return { type: 'Wallet', content: data.replace('crypto:', '') };
    }
    if (data.startsWith('QUANTUM:')) {
      return { type: 'Quantum QR', content: data };
    }
    return { type: 'Text', content: data };
  },
};
