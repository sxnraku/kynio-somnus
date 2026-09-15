import {
  calculateBedtimeOptions,
  calculateWakeOptions,
  calculateTwilightSchedule,
} from '@/services/sleepCycleService';

describe('SleepCycleService (90 min Ultradian Cycles)', () => {
  it('should calculate bedtime options for a 07:00 wake-up time', () => {
    // Definimos uma data base fixa às 20:00 para prever o despertar às 07:00 da manhã seguinte
    const baseDate = new Date(2026, 8, 15, 20, 0, 0);
    const options = calculateBedtimeOptions(7, 0, 14, baseDate);

    // 5 ciclos: 7h30 de sono + 14 min = 7h44 antes das 07:00 => 23:16
    const fiveCycles = options.find((o) => o.cycles === 5);
    expect(fiveCycles).toBeDefined();
    expect(fiveCycles?.bedtimeFormatted).toBe('23:16');
    expect(fiveCycles?.totalSleepHours).toBe(7.5);

    // 4 ciclos: 6h00 + 14 min = 6h14 antes das 07:00 => 00:46
    const fourCycles = options.find((o) => o.cycles === 4);
    expect(fourCycles?.bedtimeFormatted).toBe('00:46');

    // 6 ciclos: 9h00 + 14 min = 9h14 antes das 07:00 => 21:46
    const sixCycles = options.find((o) => o.cycles === 6);
    expect(sixCycles?.bedtimeFormatted).toBe('21:46');
  });

  it('should calculate wake-up options from a fixed bedtime', () => {
    const bedtime = new Date(2026, 8, 15, 23, 0, 0);
    const options = calculateWakeOptions(bedtime, 15);

    // 5 ciclos: 23:00 + 15m latência + 450m sono = 06:45
    const fiveCycle = options.find((o) => o.cycles === 5);
    expect(fiveCycle?.wakeTimeFormatted).toBe('06:45');

    // 4 ciclos: 23:00 + 15m + 360m = 05:15
    const fourCycle = options.find((o) => o.cycles === 4);
    expect(fourCycle?.wakeTimeFormatted).toBe('05:15');
  });

  it('should calculate twilight schedule with DLMO 2 hours before sleep', () => {
    const bedtime = new Date(2026, 8, 15, 23, 0, 0);
    const twilight = calculateTwilightSchedule(bedtime, 45);

    expect(twilight.dlmoStartTime.getHours()).toBe(21);
    expect(twilight.dlmoStartTime.getMinutes()).toBe(0);

    expect(twilight.windDownStartTime.getHours()).toBe(22);
    expect(twilight.windDownStartTime.getMinutes()).toBe(15);
  });
});
