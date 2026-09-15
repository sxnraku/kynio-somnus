import {
  calculateSleepMidpointMinutes,
  calculateCircadianStability,
  type DaySleepLog,
} from '@/services/circadianIndexService';

describe('CircadianIndexService (Stability & Social Jetlag)', () => {
  it('should calculate sleep midpoint correctly for bedtime crossing midnight', () => {
    // Deitar às 23:00 (1380m) e acordar às 07:00 (420m -> 1860m). Duração 8h (480m). Ponto médio: 23:00 + 4h = 03:00 (180m)
    const midpoint = calculateSleepMidpointMinutes(23, 0, 7, 0);
    expect(midpoint).toBe(180); // 03:00 = 180 min
  });

  it('should calculate high stability for consistent waking hours', () => {
    const consistentLogs: DaySleepLog[] = [
      { date: '2026-09-08', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-09', bedtimeHour: 23, bedtimeMinute: 5, wakeHour: 7, wakeMinute: 5, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-10', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-11', bedtimeHour: 23, bedtimeMinute: 10, wakeHour: 7, wakeMinute: 10, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-12', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-13', bedtimeHour: 23, bedtimeMinute: 15, wakeHour: 7, wakeMinute: 20, isWeekend: true, receivedMorningLight: true },
      { date: '2026-09-14', bedtimeHour: 23, bedtimeMinute: 10, wakeHour: 7, wakeMinute: 15, isWeekend: true, receivedMorningLight: true },
    ];

    const report = calculateCircadianStability(consistentLogs);
    expect(report.stabilityScore).toBeGreaterThanOrEqual(90);
    expect(report.consistencyGrade).toBe('Excelente');
    expect(report.hasExcessiveJetlag).toBe(false);
  });

  it('should flag excessive social jetlag when weekend sleep shifts by > 90 min', () => {
    const jetlagLogs: DaySleepLog[] = [
      // Dias de semana: deitar às 23:00, acordar às 07:00 (midpoint 03:00 = 180 min)
      { date: '2026-09-08', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-09', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-10', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-11', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      { date: '2026-09-12', bedtimeHour: 23, bedtimeMinute: 0, wakeHour: 7, wakeMinute: 0, isWeekend: false, receivedMorningLight: true },
      // Fim de semana: deitar às 02:00, acordar às 11:00 (midpoint 06:30 = 390 min). Jetlag = 210 min!
      { date: '2026-09-13', bedtimeHour: 2, bedtimeMinute: 0, wakeHour: 11, wakeMinute: 0, isWeekend: true, receivedMorningLight: false },
      { date: '2026-09-14', bedtimeHour: 2, bedtimeMinute: 0, wakeHour: 11, wakeMinute: 0, isWeekend: true, receivedMorningLight: false },
    ];

    const report = calculateCircadianStability(jetlagLogs);
    expect(report.socialJetlagMinutes).toBeGreaterThan(90);
    expect(report.hasExcessiveJetlag).toBe(true);
    expect(report.recommendations.some((r) => r.includes('Social Jetlag detetado'))).toBe(true);
  });
});
