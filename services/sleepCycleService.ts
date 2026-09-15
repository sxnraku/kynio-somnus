export interface SleepOption {
  cycles: number;
  totalSleepHours: number;
  bedtimeFormatted: string;
  wakeTimeFormatted: string;
  bedtimeDate: Date;
  wakeTimeDate: Date;
  qualityTag: 'ideal' | 'short' | 'recovery';
  label: string;
  description: string;
}

export interface TwilightSchedule {
  dlmoStartTime: Date; // Dim-Light Melatonin Onset (2h antes)
  windDownStartTime: Date; // Rotina de relaxamento (45m antes)
  targetBedtime: Date;
}

export function calculateBedtimeOptions(
  wakeHour: number,
  wakeMinute: number,
  latencyMin = 14,
  baseDate: Date = new Date()
): SleepOption[] {
  const targetWake = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    wakeHour,
    wakeMinute,
    0
  );

  // Se a hora de acordar já passou hoje, projeta para o dia seguinte
  if (targetWake.getTime() <= baseDate.getTime()) {
    targetWake.setDate(targetWake.getDate() + 1);
  }

  const cycleCounts = [4, 5, 6];
  return cycleCounts.map((cycles) => {
    const sleepDurationMin = cycles * 90;
    const totalMinutesBeforeWake = sleepDurationMin + latencyMin;
    const bedtime = new Date(targetWake.getTime() - totalMinutesBeforeWake * 60000);

    const bHours = String(bedtime.getHours()).padStart(2, '0');
    const bMins = String(bedtime.getMinutes()).padStart(2, '0');
    const wHours = String(targetWake.getHours()).padStart(2, '0');
    const wMins = String(targetWake.getMinutes()).padStart(2, '0');

    let qualityTag: 'ideal' | 'short' | 'recovery' = 'ideal';
    let label = '5 Ciclos (7h30)';
    let description = 'Recomendação biológica de ouro para a maioria dos adultos.';

    if (cycles === 4) {
      qualityTag = 'short';
      label = '4 Ciclos (6h00)';
      description = 'Mínimo essencial de ciclos completos. Útil em noites curtas.';
    } else if (cycles === 6) {
      qualityTag = 'recovery';
      label = '6 Ciclos (9h00)';
      description = 'Ideal para recuperação de débito de sono ou após esforço físico intenso.';
    }

    return {
      cycles,
      totalSleepHours: sleepDurationMin / 60,
      bedtimeFormatted: `${bHours}:${bMins}`,
      wakeTimeFormatted: `${wHours}:${wMins}`,
      bedtimeDate: bedtime,
      wakeTimeDate: targetWake,
      qualityTag,
      label,
      description,
    };
  });
}

export function calculateWakeOptions(
  bedtime: Date,
  latencyMin = 14
): SleepOption[] {
  const cycleCounts = [4, 5, 6];
  return cycleCounts.map((cycles) => {
    const sleepDurationMin = cycles * 90;
    const wakeTime = new Date(bedtime.getTime() + (latencyMin + sleepDurationMin) * 60000);

    const bHours = String(bedtime.getHours()).padStart(2, '0');
    const bMins = String(bedtime.getMinutes()).padStart(2, '0');
    const wHours = String(wakeTime.getHours()).padStart(2, '0');
    const wMins = String(wakeTime.getMinutes()).padStart(2, '0');

    let qualityTag: 'ideal' | 'short' | 'recovery' = 'ideal';
    let label = '5 Ciclos (7h30)';
    let description = 'Despertar limpo no final do sono REM, sem inércia de sono N3.';

    if (cycles === 4) {
      qualityTag = 'short';
      label = '4 Ciclos (6h00)';
      description = 'Noite curta mas com ciclos completos.';
    } else if (cycles === 6) {
      qualityTag = 'recovery';
      label = '6 Ciclos (9h00)';
      description = 'Sono profundo alargado para recuperação física e cognitiva.';
    }

    return {
      cycles,
      totalSleepHours: sleepDurationMin / 60,
      bedtimeFormatted: `${bHours}:${bMins}`,
      wakeTimeFormatted: `${wHours}:${wMins}`,
      bedtimeDate: bedtime,
      wakeTimeDate: wakeTime,
      qualityTag,
      label,
      description,
    };
  });
}

/**
 * Calcula o horário de início do crepúsculo biológico (DLMO)
 */
export function calculateTwilightSchedule(
  targetBedtime: Date,
  windDownDurationMin = 45
): TwilightSchedule {
  return {
    dlmoStartTime: new Date(targetBedtime.getTime() - 120 * 60000), // 2h antes
    windDownStartTime: new Date(targetBedtime.getTime() - windDownDurationMin * 60000),
    targetBedtime,
  };
}
