import { create } from 'zustand';
import {
  calculateBedtimeOptions,
  calculateWakeOptions,
  calculateTwilightSchedule,
  type SleepOption,
  type TwilightSchedule,
} from '@/services/sleepCycleService';
import { recordSleepEntry } from '@/services/dbService';

interface SleepPlannerState {
  plannerMode: 'wake_target' | 'bed_now';
  targetWakeHour: number;
  targetWakeMinute: number;
  latencyMin: number;
  selectedCycles: number; // 4, 5 ou 6
  bedtimeOptions: SleepOption[];
  twilightSchedule: TwilightSchedule | null;

  setPlannerMode: (mode: 'wake_target' | 'bed_now') => void;
  setTargetWakeTime: (hour: number, minute: number) => void;
  setSelectedCycles: (cycles: number) => void;
  setLatencyMin: (latency: number) => void;
  recomputeOptions: () => void;
  logTonightPlan: () => Promise<void>;
  logMorningRating: (score: number) => Promise<void>;
}

export const useSleepPlannerStore = create<SleepPlannerState>((set, get) => {
  const initialWakeHour = 7;
  const initialWakeMin = 0;
  const initialOptions = calculateBedtimeOptions(initialWakeHour, initialWakeMin, 14);
  const preferredOption = initialOptions.find((o) => o.cycles === 5) ?? initialOptions[0];
  const initialTwilight = calculateTwilightSchedule(preferredOption.bedtimeDate);

  return {
    plannerMode: 'wake_target',
    targetWakeHour: initialWakeHour,
    targetWakeMinute: initialWakeMin,
    latencyMin: 14,
    selectedCycles: 5,
    bedtimeOptions: initialOptions,
    twilightSchedule: initialTwilight,

    setPlannerMode: (mode) => {
      set({ plannerMode: mode });
      get().recomputeOptions();
    },

    setTargetWakeTime: (hour, minute) => {
      set({ targetWakeHour: hour, targetWakeMinute: minute });
      get().recomputeOptions();
    },

    setSelectedCycles: (cycles) => {
      set({ selectedCycles: cycles });
      get().recomputeOptions();
    },

    setLatencyMin: (latency) => {
      set({ latencyMin: latency });
      get().recomputeOptions();
    },

    recomputeOptions: () => {
      const { plannerMode, targetWakeHour, targetWakeMinute, latencyMin, selectedCycles } = get();

      let options: SleepOption[];
      if (plannerMode === 'wake_target') {
        options = calculateBedtimeOptions(targetWakeHour, targetWakeMinute, latencyMin);
      } else {
        options = calculateWakeOptions(new Date(), latencyMin);
      }

      const activeOption = options.find((o) => o.cycles === selectedCycles) ?? options[0];
      const twilight = calculateTwilightSchedule(activeOption.bedtimeDate);

      set({
        bedtimeOptions: options,
        twilightSchedule: twilight,
      });
    },

    logTonightPlan: async () => {
      const { bedtimeOptions, selectedCycles, latencyMin } = get();
      const activeOption = bedtimeOptions.find((o) => o.cycles === selectedCycles) ?? bedtimeOptions[0];

      try {
        await recordSleepEntry({
          id: `sleep_${Date.now()}`,
          targetBedtime: activeOption.bedtimeFormatted,
          targetWakeTime: activeOption.wakeTimeFormatted,
          cyclesTarget: selectedCycles,
          latencyMin,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Gravação offline resiliente
      }
    },

    logMorningRating: async (score: number) => {
      try {
        await recordSleepEntry({
          id: `rating_${Date.now()}`,
          targetBedtime: '00:00',
          targetWakeTime: '07:00',
          cyclesTarget: get().selectedCycles,
          latencyMin: get().latencyMin,
          morningEnergyScore: score,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Offline
      }
    },
  };
});
