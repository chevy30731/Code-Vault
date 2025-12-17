import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { storageService } from '@/services/storage';
import type { PremiumStatus } from '@/types/qr';
import { FREE_GENERATION_LIMIT } from '@/types/qr';

// Dynamic import helper - only load IAP on native platforms
const getIAPModule = async () => {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    const InAppPurchases = await import('expo-in-app-purchases');
    return InAppPurchases;
  } catch (error) {
    console.warn('IAP module not available on this platform:', error);
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
      // Cleanup is handled in initialize for native platforms
      if (Platform.OS !== 'web') {
        getIAPModule().then((IAP) => {
          if (IAP) {
            IAP.disconnectAsync();
          }
        });
      }
    };
  }, []);

  const initialize = async () => {
    try {
      // Load local premium status first
      const premiumStatus = await storageService.getPremiumStatus();
      setStatus(premiumStatus);

      // Skip IAP on web platform (not supported)
      if (Platform.OS === 'web') {
        setLoading(false);
        return;
      }

      // Dynamically load IAP module (native only)
      const InAppPurchases = await getIAPModule();
      if (!InAppPurchases) {
        setLoading(false);
        return;
      }

      // Connect to store
      await InAppPurchases.connectAsync();

      // Check for existing purchases
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      const hasPremiumPurchase = results?.some(
        (purchase) => purchase.productId === PREMIUM_PRODUCT_ID && purchase.acknowledged
      );

      if (hasPremiumPurchase && !premiumStatus.isPremium) {
        // User purchased on another device or reinstalled
        const newStatus: PremiumStatus = {
          isPremium: true,
          purchaseDate: Date.now(),
          generationCount: premiumStatus.generationCount,
        };
        await storageService.setPremiumStatus(newStatus);
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Error initializing IAP:', error);
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
      // Web fallback: Just toggle premium locally (for testing)
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

      // Dynamically load IAP module (native only)
      const InAppPurchases = await getIAPModule();
      if (!InAppPurchases) {
        setPurchasing(false);
        return {
          success: false,
          error: 'In-app purchases not available on this platform.',
        };
      }

      // Get available products
      const { results: products } = await InAppPurchases.getProductsAsync([PREMIUM_PRODUCT_ID]);

      if (!products || products.length === 0) {
        setPurchasing(false);
        return {
          success: false,
          error: 'Premium upgrade not available. Please try again later.',
        };
      }

      // Purchase the product
      await InAppPurchases.purchaseItemAsync(PREMIUM_PRODUCT_ID);

      // Set up purchase listener
      InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          const purchase = results?.[0];
          if (purchase && purchase.productId === PREMIUM_PRODUCT_ID) {
            // Finalize transaction
            await InAppPurchases.finishTransactionAsync(purchase, true);

            // Update local status
            const newStatus: PremiumStatus = {
              isPremium: true,
              purchaseDate: Date.now(),
              generationCount: status.generationCount,
            };
            await storageService.setPremiumStatus(newStatus);
            setStatus(newStatus);
          }
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          // User cancelled, do nothing
        } else {
          console.error('Purchase error:', errorCode);
        }
        setPurchasing(false);
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error upgrading to premium:', error);
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
