import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';

export function usePIN() {
  const [pin, setPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPIN();
  }, []);

  const loadPIN = async () => {
    const savedPIN = await storageService.getPIN();
    setPin(savedPIN);
    setLoading(false);
  };

  const setPINCode = async (newPin: string) => {
    await storageService.setPIN(newPin);
    setPin(newPin);
  };

  const removePINCode = async () => {
    await storageService.removePIN();
    setPin(null);
  };

  const verifyPIN = (inputPin: string): boolean => {
    return pin === inputPin;
  };

  return {
    pin,
    hasPIN: !!pin,
    loading,
    setPIN: setPINCode,
    removePIN: removePINCode,
    verifyPIN,
  };
}
