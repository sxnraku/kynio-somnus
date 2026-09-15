import { useLegalConsentStore } from '@/store/legal-consent-store';

describe('LegalConsentStore', () => {
  beforeEach(async () => {
    await useLegalConsentStore.getState().resetConsent();
  });

  it('should default to false and require explicit acceptance', async () => {
    expect(useLegalConsentStore.getState().hasAcceptedDisclaimer).toBe(false);
    await useLegalConsentStore.getState().acceptDisclaimer();
    expect(useLegalConsentStore.getState().hasAcceptedDisclaimer).toBe(true);
    expect(useLegalConsentStore.getState().acceptedAt).toBeDefined();
  });

  it('should reset consent when requested', async () => {
    await useLegalConsentStore.getState().acceptDisclaimer();
    expect(useLegalConsentStore.getState().hasAcceptedDisclaimer).toBe(true);
    await useLegalConsentStore.getState().resetConsent();
    expect(useLegalConsentStore.getState().hasAcceptedDisclaimer).toBe(false);
  });
});
