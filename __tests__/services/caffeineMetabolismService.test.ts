import {
  calculateRemainingCaffeineMg,
  calculateCaffeineCutoffHour,
  calculateTotalRemainingCaffeineMg,
  getCaffeineWindowStatus,
} from '@/services/caffeineMetabolismService';

describe('CaffeineMetabolismService', () => {
  it('should reduce caffeine by half after one half-life period', () => {
    const consumedAt = new Date('2026-09-15T12:00:00Z');
    const checkedAt = new Date('2026-09-15T18:00:00Z'); // 6 horas depois
    const remaining = calculateRemainingCaffeineMg(100, consumedAt, checkedAt, 6);
    expect(Math.round(remaining)).toBe(50);
  });

  it('should calculate cutoff hour ~9 hours prior to target bedtime', () => {
    // Deitar às 23:00 -> corte de cafeína às 14:00 (com meia-vida de 5.5h a 6h)
    const cutoff = calculateCaffeineCutoffHour(23, 5.5);
    expect(cutoff).toBe(14);
  });

  it('should sum cumulative remaining caffeine across multiple intakes', () => {
    const entries = [
      { amountMg: 80, consumedAt: new Date('2026-09-15T08:00:00Z') }, // 6h decorridas -> 40mg
      { amountMg: 80, consumedAt: new Date('2026-09-15T14:00:00Z') }, // 0h decorridas -> 80mg
    ];
    const total = calculateTotalRemainingCaffeineMg(entries, new Date('2026-09-15T14:00:00Z'), 6);
    expect(Math.round(total)).toBe(120);
  });

  it('should flag window as closed after cutoff hour', () => {
    // Hora atual: 16:00, Hora de deitar: 23:00 (corte às 14:00)
    const status = getCaffeineWindowStatus(16, 23, 5.5);
    expect(status.isWindowOpen).toBe(false);
    expect(status.statusMessage).toContain('Janela bloqueada');
  });

  it('should flag window as open before cutoff hour', () => {
    // Hora atual: 10:00, Hora de deitar: 23:00 (corte às 14:00)
    const status = getCaffeineWindowStatus(10, 23, 5.5);
    expect(status.isWindowOpen).toBe(true);
    expect(status.hoursUntilCutoff).toBe(4);
  });
});
