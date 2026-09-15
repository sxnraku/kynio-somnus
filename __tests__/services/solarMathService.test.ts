import {
  calculateSolarTimes,
  calculateSolarElevationAngle,
  getRecommendedLightExposureMinutes,
} from '@/services/solarMathService';

describe('SolarMathService (NOAA Equations Offline)', () => {
  const LISBON_LAT = 38.7223;
  const LISBON_LON = -9.1393;
  // Equinócio da Primavera
  const TEST_DATE = new Date('2026-03-20T12:00:00Z');

  it('should calculate sunrise, noon and sunset in proper chronological order', () => {
    const times = calculateSolarTimes(LISBON_LAT, LISBON_LON, TEST_DATE);
    expect(times.sunrise.getTime()).toBeLessThan(times.solarNoon.getTime());
    expect(times.solarNoon.getTime()).toBeLessThan(times.sunset.getTime());
    expect(times.dawn.getTime()).toBeLessThan(times.sunrise.getTime());
    expect(times.sunset.getTime()).toBeLessThan(times.dusk.getTime());
  });

  it('should calculate solar noon in Lisbon between 12:30 and 12:50 UTC', () => {
    const times = calculateSolarTimes(LISBON_LAT, LISBON_LON, TEST_DATE);
    const noonHours = times.solarNoon.getUTCHours() + times.solarNoon.getUTCMinutes() / 60;
    expect(noonHours).toBeGreaterThan(12.5);
    expect(noonHours).toBeLessThan(12.85);
  });

  it('should calculate elevation around 51 degrees at solar noon on equinox in Lisbon', () => {
    // No equinócio, em latitude 38.72°, a altitude zenital é 90 - 38.72 ≈ 51.3°
    const elevation = calculateSolarElevationAngle(LISBON_LAT, LISBON_LON, new Date('2026-03-20T12:40:00Z'));
    expect(elevation).toBeGreaterThan(48);
    expect(elevation).toBeLessThan(54);
  });

  it('should recommend correct exposure durations based on sky condition', () => {
    const directSun = getRecommendedLightExposureMinutes(25, 'direct_sun');
    expect(directSun.recommendedMinutes).toBe(10);

    const cloudy = getRecommendedLightExposureMinutes(25, 'cloudy');
    expect(cloudy.recommendedMinutes).toBe(20);

    const window = getRecommendedLightExposureMinutes(25, 'window');
    expect(window.recommendedMinutes).toBe(60);
  });
});
