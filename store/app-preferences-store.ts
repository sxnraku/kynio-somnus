import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'kynio_somnus_app_preferences';

export type ThemePreference = 'auto_circadian' | 'light' | 'dark';

interface AppPreferencesState {
  themeMode: ThemePreference;
  caffeineHalfLifeHours: number;
  isProUser: boolean;
  notificationsEnabled: boolean;
  isLoaded: boolean;

  setThemeMode: (mode: ThemePreference) => void;
  setCaffeineHalfLifeHours: (hours: number) => void;
  setIsProUser: (isPro: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

export const useAppPreferencesStore = create<AppPreferencesState>((set, get) => ({
  themeMode: 'auto_circadian',
  caffeineHalfLifeHours: 5.5,
  isProUser: false,
  notificationsEnabled: true,
  isLoaded: false,

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    get().savePreferences();
  },

  setCaffeineHalfLifeHours: (hours) => {
    set({ caffeineHalfLifeHours: hours });
    get().savePreferences();
  },

  setIsProUser: (isPro) => {
    set({ isProUser: isPro });
    get().savePreferences();
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().savePreferences();
  },

  loadPreferences: async () => {
    try {
      const data = await AsyncStorage.getItem(PREFS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          themeMode: parsed.themeMode ?? 'auto_circadian',
          caffeineHalfLifeHours: parsed.caffeineHalfLifeHours ?? 5.5,
          isProUser: parsed.isProUser ?? false,
          notificationsEnabled: parsed.notificationsEnabled ?? true,
          isLoaded: true,
        });
        return;
      }
    } catch {
      // Defaults
    }
    set({ isLoaded: true });
  },

  savePreferences: async () => {
    const { themeMode, caffeineHalfLifeHours, isProUser, notificationsEnabled } = get();
    try {
      await AsyncStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          themeMode,
          caffeineHalfLifeHours,
          isProUser,
          notificationsEnabled,
        })
      );
    } catch {
      // Local ignore
    }
  },
}));
