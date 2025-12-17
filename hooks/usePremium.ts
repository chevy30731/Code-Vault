import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { storageService } from '@/services/storage';
import type { PremiumStatus } from '@/types/qr';
import { FREE_GENERATION_LIMIT } from '@/types/qr';

// Conditional import helper for native platforms only
let InAppPurchases: any = null;
let IAPResponseCode: any = null;

const initializeIAP = async () => {
  if (Platform.OS === 'web') return null;
  
  try {
    const iapModule = await import('expo-in-app-purchases');
    InAppPurchases = iapModule;
    IAPResponseCode = iapModule.IAPResponseCode;
    return iapModule;
  } catch (error) {
    console.warn('IAP module unavailable:', error);
    return null;
  }
};

const PREMIUM_PRODUCT_ID = Platform.select({
  ios: 'codevault_premium',
  android: 'codevault_premium',
  default: 'codevault_premium',
}) as string;

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    generationCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    initialize();
    
    return () => {
      // Cleanup IAP connection on unmount (native only)
      if (Platform.OS !== 'web' && InAppPurchases) {
        InAppPurchases.disconnectAsync().catch(() => {});
      }
    };
  }, []);

  const initialize = async () => {
    try {
      // Load local premium status
      const premiumStatus = await storageService.getPremiumStatus();
      setStatus(premiumStatus);

      // Skip IAP initialization on web
      if (Platform.OS === 'web') {
        setLoading(false);
        return;
      }

      // Initialize IAP module
      const iapModule = await initializeIAP();
      if (!iapModule) {
        setLoading(false);
        return;
      }

      // Connect to store
      await iapModule.connectAsync();

      // Check purchase history
      const { results } = await iapModule.getPurchaseHistoryAsync();
      const hasPremium = results?.some(
        (p: any) => p.productId === PREMIUM_PRODUCT_ID && p.acknowledged
      );

      if (hasPremium && !premiumStatus.isPremium) {
        // Restore purchase
        const newStatus: PremiumStatus = {
          isPremium: true,
          purchaseDate: Date.now(),
          generationCount: premiumStatus.generationCount,
        };
        await storageService.setPremiumStatus(newStatus);
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('IAP initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setPurchasing(true);

    try {
      // Web fallback: Local toggle for testing
      if (Platform.OS === 'web') {
        const newStatus: PremiumStatus = {
          isPremium: true,
          purchaseDate: Date.now(),
          generationCount: status.generationCount,
        };
        await storageService.setPremiumStatus(newStatus);
        setStatus(newStatus);
        setPurchasing(false);
        return { success: true };
      }

      // Initialize IAP if not already done
      if (!InAppPurchases) {
        await initializeIAP();
      }

      if (!InAppPurchases) {
        setPurchasing(false);
        return {
          success: false,
          error: 'In-app purchases not available on this platform',
        };
      }

      // Get products
      const { results: products } = await InAppPurchases.getProductsAsync([
        PREMIUM_PRODUCT_ID,
      ]);

      if (!products || products.length === 0) {
        setPurchasing(false);
        return {
          success: false,
          error: 'Premium upgrade currently unavailable. Please try again later.',
        };
      }

      // Set up purchase listener BEFORE starting purchase
      InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }: any) => {
        if (responseCode === IAPResponseCode.OK && results?.[0]) {
          const purchase = results[0];
          
          if (purchase.productId === PREMIUM_PRODUCT_ID) {
            // Finalize transaction
            await InAppPurchases.finishTransactionAsync(purchase, true);

            // Update status
            const newStatus: PremiumStatus = {
              isPremium: true,
              purchaseDate: Date.now(),
              generationCount: status.generationCount,
            };
            await storageService.setPremiumStatus(newStatus);
            setStatus(newStatus);
            setPurchasing(false);
          }
        } else if (responseCode === IAPResponseCode.USER_CANCELED) {
          setPurchasing(false);
        } else {
          console.error('Purchase error code:', errorCode);
          setPurchasing(false);
        }
      });

      // Initiate purchase
      await InAppPurchases.purchaseItemAsync(PREMIUM_PRODUCT_ID);

      return { success: true };
    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchasing(false);
      return {
        success: false,
        error: error.message || 'Purchase failed. Please try again.',
      };
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
    purchasing,
    upgradeToPremium,
    incrementGeneration,
    refresh: initialize,
  };
}
