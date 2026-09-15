import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kynio_somnus_legal_consent';

interface LegalConsentState {
  hasAcceptedDisclaimer: boolean;
  acceptedAt: string | null;
  isLoading: boolean;
  initializeConsent: () => Promise<void>;
  acceptDisclaimer: () => Promise<void>;
  resetConsent: () => Promise<void>;
}

export const useLegalConsentStore = create<LegalConsentState>((set) => ({
  hasAcceptedDisclaimer: false,
  acceptedAt: null,
  isLoading: true,
  initializeConsent: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ hasAcceptedDisclaimer: true, acceptedAt: stored, isLoading: false });
      } else {
        set({ hasAcceptedDisclaimer: false, acceptedAt: null, isLoading: false });
      }
    } catch {
      set({ hasAcceptedDisclaimer: false, isLoading: false });
    }
  },
  acceptDisclaimer: async () => {
    const timestamp = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEY, timestamp);
    set({ hasAcceptedDisclaimer: true, acceptedAt: timestamp });
  },
  resetConsent: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ hasAcceptedDisclaimer: false, acceptedAt: null });
  },
}));
