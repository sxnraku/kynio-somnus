export interface DaySleepLog {
  date: string; // YYYY-MM-DD
  bedtimeHour: number;
  bedtimeMinute: number;
  wakeHour: number;
  wakeMinute: number;
  isWeekend: boolean;
  receivedMorningLight: boolean;
}

export interface CircadianStabilityReport {
  stabilityScore: number; // 0 a 100
  wakeVarianceMinutes: number;
  socialJetlagMinutes: number;
  hasExcessiveJetlag: boolean; // > 90 min
  consistencyGrade: 'Excelente' | 'Boa' | 'Irregular' | 'Em Ajuste';
  recommendations: string[];
}

/**
 * Converte hora e minuto para minutos totais desde a meia-noite (0..1439)
 */
function toMinutesFromMidnight(hour: number, minute: number): number {
  return hour * 60 + minute;
}

/**
 * Calcula o ponto médio de sono (Sleep Midpoint)
 */
export function calculateSleepMidpointMinutes(
  bedHour: number,
  bedMin: number,
  wakeHour: number,
  wakeMin: number
): number {
  let bedTotal = toMinutesFromMidnight(bedHour, bedMin);
  let wakeTotal = toMinutesFromMidnight(wakeHour, wakeMin);

  // Se deitou antes da meia-noite e acordou depois
  if (wakeTotal < bedTotal) {
    wakeTotal += 1440;
  }

  const duration = wakeTotal - bedTotal;
  const midpoint = (bedTotal + duration / 2) % 1440;
  return Math.round(midpoint);
}

/**
 * Calcula a estabilidade circadiana dos últimos 7 dias e o Social Jetlag
 */
export function calculateCircadianStability(logs: DaySleepLog[]): CircadianStabilityReport {
  if (logs.length === 0) {
    return {
      stabilityScore: 85,
      wakeVarianceMinutes: 0,
      socialJetlagMinutes: 0,
      hasExcessiveJetlag: false,
      consistencyGrade: 'Em Ajuste',
      recommendations: [
        'Registe o seu despertar e sessão de luz matinal durante 7 dias para desbloquear a análise de estabilidade.',
      ],
    };
  }

  // 1. Variância da hora de despertar
  const wakeMinutesList = logs.map((l) => toMinutesFromMidnight(l.wakeHour, l.wakeMinute));
  const avgWakeMinutes =
    wakeMinutesList.reduce((acc, m) => acc + m, 0) / wakeMinutesList.length;

  const variance =
    wakeMinutesList.reduce((acc, m) => acc + Math.pow(m - avgWakeMinutes, 2), 0) /
    wakeMinutesList.length;
  const stdDevWakeMinutes = Math.round(Math.sqrt(variance));

  // 2. Cálculo do Social Jetlag (Desvio entre dias úteis e fins de semana)
  const weekdayLogs = logs.filter((l) => !l.isWeekend);
  const weekendLogs = logs.filter((l) => l.isWeekend);

  let socialJetlagMinutes = 0;
  if (weekdayLogs.length > 0 && weekendLogs.length > 0) {
    const avgWeekdayMidpoint =
      weekdayLogs
        .map((l) => calculateSleepMidpointMinutes(l.bedtimeHour, l.bedtimeMinute, l.wakeHour, l.wakeMinute))
        .reduce((a, b) => a + b, 0) / weekdayLogs.length;

    const avgWeekendMidpoint =
      weekendLogs
        .map((l) => calculateSleepMidpointMinutes(l.bedtimeHour, l.bedtimeMinute, l.wakeHour, l.wakeMinute))
        .reduce((a, b) => a + b, 0) / weekendLogs.length;

    socialJetlagMinutes = Math.round(Math.abs(avgWeekendMidpoint - avgWeekdayMidpoint));
  }

  // 3. Pontuação de Estabilidade (0 a 100)
  // Desvio padrão <= 20 min -> 100 pontos; > 90 min -> penalização progressiva
  let stabilityScore = 100 - Math.min(50, Math.round(stdDevWakeMinutes * 0.5));

  // Penalização por Social Jetlag excessivo (>60 min)
  if (socialJetlagMinutes > 60) {
    const jetlagPenalty = Math.min(30, Math.round((socialJetlagMinutes - 60) * 0.4));
    stabilityScore -= jetlagPenalty;
  }

  stabilityScore = Math.max(20, Math.min(100, stabilityScore));

  let consistencyGrade: 'Excelente' | 'Boa' | 'Irregular' | 'Em Ajuste' = 'Excelente';
  if (stabilityScore < 60) {
    consistencyGrade = 'Irregular';
  } else if (stabilityScore < 80) {
    consistencyGrade = 'Boa';
  }

  const recommendations: string[] = [];
  const hasExcessiveJetlag = socialJetlagMinutes > 90;

  if (hasExcessiveJetlag) {
    recommendations.push(
      `Social Jetlag detetado de ${socialJetlagMinutes} min. Tente não adiar o despertar no fim de semana em mais de 60 minutos para evitar a névoa mental de segunda-feira.`
    );
  }

  if (stdDevWakeMinutes > 45) {
    recommendations.push(
      `A oscilação do horário de despertar é de ~${stdDevWakeMinutes} min. Fixar uma âncora de acordar mesmo após noites mais curtas acelera a sincronização do relógio biológico.`
    );
  } else {
    recommendations.push(
      'Excelente consistência de despertar! A sua âncora circadiana matinal está altamente estável.'
    );
  }

  return {
    stabilityScore,
    wakeVarianceMinutes: stdDevWakeMinutes,
    socialJetlagMinutes,
    hasExcessiveJetlag,
    consistencyGrade,
    recommendations,
  };
}
