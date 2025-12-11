import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { storageService } from '@/services/storage';
import type { PremiumStatus } from '@/types/qr';
import { FREE_GENERATION_LIMIT } from '@/types/qr';

// Only import IAP on native platforms (not web)
let InAppPurchases: any = null;
if (Platform.OS !== 'web') {
  InAppPurchases = require('expo-in-app-purchases');
}

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
      if (Platform.OS !== 'web' && InAppPurchases) {
        InAppPurchases.disconnectAsync();
      }
    };
  }, []);

  const initialize = async () => {
    try {
      // Load local premium status
      const premiumStatus = await storageService.getPremiumStatus();
      setStatus(premiumStatus);

      // Skip IAP on web
      if (Platform.OS === 'web') {
        setLoading(false);
        return;
      }

      // Connect to store on native platforms
      if (InAppPurchases) {
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
    // Web fallback: enable premium locally (for development/testing)
    if (Platform.OS === 'web') {
      const newStatus: PremiumStatus = {
        isPremium: true,
        purchaseDate: Date.now(),
        generationCount: status.generationCount,
      };
      await storageService.setPremiumStatus(newStatus);
      setStatus(newStatus);
      return { success: true };
    }

    if (!InAppPurchases) {
      return {
        success: false,
        error: 'In-app purchases not available on this platform.',
      };
    }

    setPurchasing(true);
    try {
      // Get available products
      const { results: products } = await InAppPurchases.getProductsAsync([PREMIUM_PRODUCT_ID]);

      if (!products || products.length === 0) {
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
