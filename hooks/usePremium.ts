import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';
import type { PremiumStatus } from '@/types/qr';
import { FREE_GENERATION_LIMIT } from '@/types/qr';

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    generationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const premiumStatus = await storageService.getPremiumStatus();
      setStatus(premiumStatus);
    } catch (error) {
      console.error('Error loading premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async () => {
    try {
      const newStatus: PremiumStatus = {
        isPremium: true,
        purchaseDate: Date.now(),
        generationCount: status.generationCount,
      };
      await storageService.setPremiumStatus(newStatus);
      setStatus(newStatus);
      return true;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return false;
    }
  };

  const canGenerate = () => {
    if (status.isPremium) return true;
    return status.generationCount < FREE_GENERATION_LIMIT;
  };

  const getRemainingGenerations = () => {
    if (status.isPremium) return -1; // Unlimited
    return Math.max(0, FREE_GENERATION_LIMIT - status.generationCount);
  };

  const incrementGeneration = async () => {
    const newCount = await storageService.incrementGenerationCount();
    setStatus((prev) => ({ ...prev, generationCount: newCount }));
  };

  return {
    isPremium: status.isPremium,
    generationCount: status.generationCount,
    canGenerate: canGenerate(),
    remainingGenerations: getRemainingGenerations(),
    loading,
    upgradeToPremium,
    incrementGeneration,
    refresh: loadStatus,
  };
}