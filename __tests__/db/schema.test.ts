import { sleepEntries, lightSessions, caffeineEntries, userCircadianProfile } from '@/db/schema';

describe('Database Schema Entities', () => {
  it('should define sleepEntries with required fields', () => {
    expect(sleepEntries.id).toBeDefined();
    expect(sleepEntries.targetWakeTime).toBeDefined();
    expect(sleepEntries.cyclesTarget).toBeDefined();
    expect(sleepEntries.deletedAt).toBeDefined();
  });

  it('should define lightSessions with solar elevation and duration', () => {
    expect(lightSessions.durationMinutes).toBeDefined();
    expect(lightSessions.solarElevationDeg).toBeDefined();
    expect(lightSessions.type).toBeDefined();
  });

  it('should define caffeineEntries with amount and source', () => {
    expect(caffeineEntries.amountMg).toBeDefined();
    expect(caffeineEntries.source).toBeDefined();
    expect(caffeineEntries.consumedAt).toBeDefined();
  });

  it('should define userCircadianProfile with default half life', () => {
    expect(userCircadianProfile.caffeineHalfLifeHours).toBeDefined();
    expect(userCircadianProfile.windDownMinutes).toBeDefined();
  });
});
