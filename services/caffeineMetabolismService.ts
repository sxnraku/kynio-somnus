export interface CaffeineIntakeSource {
  id: string;
  name: string;
  defaultMg: number;
  iconName: string;
}

export const COMMON_CAFFEINE_SOURCES: CaffeineIntakeSource[] = [
  { id: 'espresso', name: 'Café Expresso', defaultMg: 80, iconName: 'cafe-outline' },
  { id: 'double_espresso', name: 'Expresso Duplo', defaultMg: 160, iconName: 'cafe' },
  { id: 'filter_coffee', name: 'Café de Filtro / Caneca', defaultMg: 140, iconName: 'cup-outline' },
  { id: 'black_tea', name: 'Chá Preto', defaultMg: 45, iconName: 'leaf-outline' },
  { id: 'green_tea', name: 'Chá Verde', defaultMg: 30, iconName: 'leaf' },
  { id: 'energy_drink', name: 'Bebida Energética', defaultMg: 120, iconName: 'flash-outline' },
  { id: 'pre_workout', name: 'Pré-Treino', defaultMg: 200, iconName: 'barbell-outline' },
];

/**
 * Calcula a quantidade de cafeína residual no organismo através do modelo de decaimento exponencial.
 * C(t) = C0 * (0.5)^(Δt / t_half)
 */
export function calculateRemainingCaffeineMg(
  consumedMg: number,
  consumedAt: Date,
  targetTime: Date,
  halfLifeHours = 5.5
): number {
  const elapsedMs = targetTime.getTime() - consumedAt.getTime();
  if (elapsedMs <= 0) {
    return consumedMg;
  }
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const remaining = consumedMg * Math.pow(0.5, elapsedHours / halfLifeHours);
  return Math.max(0, remaining);
}

/**
 * Calcula o somatório de cafeína circulante acumulada a partir de múltiplos consumos
 */
export function calculateTotalRemainingCaffeineMg(
  entries: { amountMg: number; consumedAt: string | Date }[],
  targetTime: Date = new Date(),
  halfLifeHours = 5.5
): number {
  return entries.reduce((total, entry) => {
    const consumedAt = typeof entry.consumedAt === 'string' ? new Date(entry.consumedAt) : entry.consumedAt;
    return total + calculateRemainingCaffeineMg(entry.amountMg, consumedAt, targetTime, halfLifeHours);
  }, 0);
}

/**
 * Calcula a hora limite ideal para corte de ingestão de cafeína
 * Para proteger os recetores de adenosina no sono profundo N3, a ingestão deve cessar
 * ~1.6 meias-vidas (8-10 horas) antes do horário de deitar.
 */
export function calculateCaffeineCutoffHour(
  bedtimeHour: number,
  halfLifeHours = 5.5
): number {
  const clearanceWindowHours = Math.round(halfLifeHours * 1.6);
  const cutoff = (bedtimeHour - clearanceWindowHours + 24) % 24;
  return cutoff;
}

/**
 * Avalia o estado da janela de cafeína relativamente à hora de deitar
 */
export function getCaffeineWindowStatus(
  currentHour: number,
  bedtimeHour: number,
  halfLifeHours = 5.5
): {
  isWindowOpen: boolean;
  cutoffHour: number;
  hoursUntilCutoff: number;
  statusMessage: string;
} {
  const cutoffHour = calculateCaffeineCutoffHour(bedtimeHour, halfLifeHours);

  let hoursUntilCutoff = cutoffHour - currentHour;
  if (hoursUntilCutoff < -12) hoursUntilCutoff += 24;

  const isWindowOpen = hoursUntilCutoff > 0;

  if (isWindowOpen) {
    return {
      isWindowOpen: true,
      cutoffHour,
      hoursUntilCutoff,
      statusMessage: `Janela aberta. Restam cerca de ${hoursUntilCutoff}h até ao corte para proteger a adenosina noturna.`,
    };
  }

  return {
    isWindowOpen: false,
    cutoffHour,
    hoursUntilCutoff: 0,
    statusMessage: 'Janela bloqueada. Qualquer cafeína ingerida agora prejudicará a profundidade do sono N3.',
  };
}
