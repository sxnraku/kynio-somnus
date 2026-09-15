import { create } from 'zustand';
import {
  calculateSolarTimes,
  calculateSolarElevationAngle,
  getRecommendedLightExposureMinutes,
  type SolarDayTimes,
} from '@/services/solarMathService';
import { recordLightSession } from '@/services/dbService';

interface CircadianState {
  latitude: number;
  longitude: number;
  locationStatus: 'undetermined' | 'granted' | 'denied';
  solarTimes: SolarDayTimes | null;
  currentElevationDeg: number;
  skyCondition: 'direct_sun' | 'cloudy' | 'window';
  recommendedMinutes: number;
  recommendationRationale: string;
  isTimerRunning: boolean;
  timerTargetMinutes: number;
  timerElapsedSeconds: number;
  timerCompleted: boolean;

  requestLocationAndCompute: () => Promise<void>;
  refreshSolarElevation: () => void;
  setSkyCondition: (condition: 'direct_sun' | 'cloudy' | 'window') => void;
  startLightTimer: (customMinutes?: number) => void;
  tickTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveCompletedSession: () => Promise<void>;
}

// Lisboa como coordenadas padrão de alta precisão
const DEFAULT_LAT = 38.7223;
const DEFAULT_LON = -9.1393;

export const useCircadianStore = create<CircadianState>((set, get) => ({
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LON,
  locationStatus: 'undetermined',
  solarTimes: calculateSolarTimes(DEFAULT_LAT, DEFAULT_LON, new Date()),
  currentElevationDeg: calculateSolarElevationAngle(DEFAULT_LAT, DEFAULT_LON, new Date()),
  skyCondition: 'direct_sun',
  recommendedMinutes: 10,
  recommendationRationale: 'Céu limpo com elevação solar favorável.',
  isTimerRunning: false,
  timerTargetMinutes: 10,
  timerElapsedSeconds: 0,
  timerCompleted: false,

  requestLocationAndCompute: async () => {
    try {
      // 1. Tentar expo-location dinamicamente
      let LocationModule: any = null;
      try {
        LocationModule = require('expo-location');
      } catch {
        // Módulo nativo não empacotado no ambiente atual
      }

      if (LocationModule?.requestForegroundPermissionsAsync) {
        const { status } = await LocationModule.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await LocationModule.getCurrentPositionAsync({});
          const lat = loc.coords.latitude;
          const lon = loc.coords.longitude;
          const now = new Date();
          const times = calculateSolarTimes(lat, lon, now);
          const elevation = calculateSolarElevationAngle(lat, lon, now);
          const rec = getRecommendedLightExposureMinutes(elevation, get().skyCondition);

          set({
            latitude: lat,
            longitude: lon,
            locationStatus: 'granted',
            solarTimes: times,
            currentElevationDeg: elevation,
            recommendedMinutes: rec.recommendedMinutes,
            recommendationRationale: rec.rationale,
            timerTargetMinutes: rec.recommendedMinutes,
          });
          return;
        }
      }
    } catch {
      // Fallback
    }

    const now = new Date();
    set({
      locationStatus: 'granted',
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
      solarTimes: calculateSolarTimes(DEFAULT_LAT, DEFAULT_LON, now),
      currentElevationDeg: calculateSolarElevationAngle(DEFAULT_LAT, DEFAULT_LON, now),
    });
  },

  refreshSolarElevation: () => {
    const { latitude, longitude, skyCondition } = get();
    const now = new Date();
    const elevation = calculateSolarElevationAngle(latitude, longitude, now);
    const rec = getRecommendedLightExposureMinutes(elevation, skyCondition);
    set({
      currentElevationDeg: elevation,
      recommendedMinutes: rec.recommendedMinutes,
      recommendationRationale: rec.rationale,
    });
  },

  setSkyCondition: (condition) => {
    const { currentElevationDeg } = get();
    const rec = getRecommendedLightExposureMinutes(currentElevationDeg, condition);
    set({
      skyCondition: condition,
      recommendedMinutes: rec.recommendedMinutes,
      recommendationRationale: rec.rationale,
      timerTargetMinutes: rec.recommendedMinutes,
    });
  },

  startLightTimer: (customMinutes) => {
    const target = customMinutes ?? get().recommendedMinutes;
    set({
      isTimerRunning: true,
      timerTargetMinutes: target,
      timerCompleted: false,
    });
  },

  tickTimer: () => {
    const { isTimerRunning, timerElapsedSeconds, timerTargetMinutes } = get();
    if (!isTimerRunning) return;

    const nextSeconds = timerElapsedSeconds + 1;
    const targetSeconds = timerTargetMinutes * 60;

    if (nextSeconds >= targetSeconds) {
      set({
        timerElapsedSeconds: targetSeconds,
        isTimerRunning: false,
        timerCompleted: true,
      });
      get().saveCompletedSession();
    } else {
      set({ timerElapsedSeconds: nextSeconds });
    }
  },

  pauseTimer: () => set({ isTimerRunning: false }),

  resetTimer: () =>
    set({
      isTimerRunning: false,
      timerElapsedSeconds: 0,
      timerCompleted: false,
    }),

  saveCompletedSession: async () => {
    const { timerTargetMinutes, skyCondition, currentElevationDeg } = get();
    try {
      await recordLightSession({
        id: `light_${Date.now()}`,
        startedAt: new Date(Date.now() - timerTargetMinutes * 60000).toISOString(),
        durationMinutes: timerTargetMinutes,
        type: skyCondition,
        solarElevationDeg: currentElevationDeg,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Gravação local em background
    }
  },
}));
