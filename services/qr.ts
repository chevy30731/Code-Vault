import type { QRData, ContactData, LocationData } from '@/types/qr';

export const qrService = {
  generateText(text: string): QRData {
    return { type: 'text', data: text };
  },

  generateURL(url: string): QRData {
    const formattedURL = url.startsWith('http') ? url : `https://${url}`;
    return { type: 'url', data: formattedURL };
  },

  generateEmail(email: string, subject?: string, body?: string): QRData {
    let data = `mailto:${email}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length > 0) data += `?${params.join('&')}`;
    return { type: 'email', data };
  },

  generateSMS(phone: string, message?: string): QRData {
    let data = `sms:${phone}`;
    if (message) data += `?body=${encodeURIComponent(message)}`;
    return { type: 'sms', data };
  },

  generateContact(contact: ContactData): QRData {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      contact.phone ? `TEL:${contact.phone}` : '',
      contact.email ? `EMAIL:${contact.email}` : '',
      contact.organization ? `ORG:${contact.organization}` : '',
      contact.website ? `URL:${contact.website}` : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');
    return { type: 'contact', data: vcard };
  },

  generateLocation(location: LocationData): QRData {
    const data = `geo:${location.latitude},${location.longitude}${
      location.label ? `?q=${encodeURIComponent(location.label)}` : ''
    }`;
    return { type: 'location', data };
  },

  generateWallet(address: string): QRData {
    return { type: 'wallet', data: address };
  },

  generateEncrypted(data: string): QRData {
    return { type: 'encrypted', data, encrypted: true };
  },

  parseQRData(rawData: string): QRData {
    if (rawData.startsWith('mailto:')) {
      return { type: 'email', data: rawData };
    }
    if (rawData.startsWith('sms:')) {
      return { type: 'sms', data: rawData };
    }
    if (rawData.startsWith('geo:')) {
      return { type: 'location', data: rawData };
    }
    if (rawData.startsWith('BEGIN:VCARD')) {
      return { type: 'contact', data: rawData };
    }
    if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
      return { type: 'url', data: rawData };
    }
    if (rawData.startsWith('CODEVAULT_ENCRYPTED:')) {
      return { type: 'encrypted', data: rawData, encrypted: true };
    }
    return { type: 'text', data: rawData };
  },
};