import { checkProStatus, restoreProPurchases } from '@/services/inAppPurchaseService';

describe('InAppPurchaseService (RevenueCat)', () => {
  it('should verify customer entitlement for pro access', async () => {
    const isPro = await checkProStatus();
    expect(typeof isPro).toBe('boolean');
  });

  it('should attempt restore purchases and return status', async () => {
    const restored = await restoreProPurchases();
    expect(typeof restored).toBe('boolean');
  });
});
