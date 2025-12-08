import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';
import type { PINConfig } from '@/types/qr';

export function usePIN() {
  const [config, setConfig] = useState<PINConfig>({ enabled: false, pin: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const pinConfig = await storageService.getPINConfig();
      setConfig(pinConfig);
    } catch (error) {
      console.error('Error loading PIN config:', error);
    } finally {
      setLoading(false);
    }
  };

  const setPIN = async (pin: string) => {
    try {
      const newConfig: PINConfig = { enabled: true, pin };
      await storageService.setPINConfig(newConfig);
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      return false;
    }
  };

  const disablePIN = async () => {
    try {
      const newConfig: PINConfig = { enabled: false, pin: '' };
      await storageService.setPINConfig(newConfig);
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Error disabling PIN:', error);
      return false;
    }
  };

  const verifyPIN = async (pin: string): Promise<boolean> => {
    return storageService.verifyPIN(pin);
  };

  return {
    enabled: config.enabled,
    loading,
    setPIN,
    disablePIN,
    verifyPIN,
    refresh: loadConfig,
  };
}