export interface SolarDayTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dawn: Date;
  dusk: Date;
  daylightMinutes: number;
}

const degToRad = (deg: number): number => (deg * Math.PI) / 180;
const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function calculateSolarDeclinationAndEoT(date: Date) {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;

  const geomMeanLongSun = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
  const geomMeanAnomSun = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const eccentEarthOrbit = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const sunEqOfCtr =
    Math.sin(degToRad(geomMeanAnomSun)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(degToRad(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * T) +
    Math.sin(degToRad(3 * geomMeanAnomSun)) * 0.000289;

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr;
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(degToRad(125.04 - 1934.136 * T));

  const meanObliqEcliptic =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(degToRad(125.04 - 1934.136 * T));

  const sunDeclin = radToDeg(Math.asin(Math.sin(degToRad(obliqCorr)) * Math.sin(degToRad(sunAppLong))));

  const y = Math.tan(degToRad(obliqCorr / 2)) ** 2;
  const eqOfTime =
    4 *
    radToDeg(
      y * Math.sin(2 * degToRad(geomMeanLongSun)) -
        2 * eccentEarthOrbit * Math.sin(degToRad(geomMeanAnomSun)) +
        4 * eccentEarthOrbit * y * Math.sin(degToRad(geomMeanAnomSun)) * Math.cos(2 * degToRad(geomMeanLongSun)) -
        0.5 * (y ** 2) * Math.sin(4 * degToRad(geomMeanLongSun)) -
        1.25 * (eccentEarthOrbit ** 2) * Math.sin(2 * degToRad(geomMeanAnomSun))
    );

  return { sunDeclin, eqOfTime };
}

/**
 * Calcula o ângulo de elevação solar (em graus) relativamente ao horizonte
 * > 0: Sol acima do horizonte
 * < 0: Sol abaixo do horizonte (crepúsculo / noite)
 */
export function calculateSolarElevationAngle(lat: number, lon: number, date: Date): number {
  const { sunDeclin, eqOfTime } = calculateSolarDeclinationAndEoT(date);

  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarTime = (utcMinutes + eqOfTime + 4 * lon + 1440) % 1440;
  let hourAngle = trueSolarTime / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;

  const csz =
    Math.sin(degToRad(lat)) * Math.sin(degToRad(sunDeclin)) +
    Math.cos(degToRad(lat)) * Math.cos(degToRad(sunDeclin)) * Math.cos(degToRad(hourAngle));

  const zenith = radToDeg(Math.acos(Math.max(-1, Math.min(1, csz))));
  return 90 - zenith;
}

/**
 * Calcula horas exatas de Nascer do Sol, Pôr do Sol, Meio-Dia Solar, Alvorada e Crepúsculo
 * utilizando as equações astronómicas completas da NOAA 100% offline.
 */
export function calculateSolarTimes(lat: number, lon: number, date: Date): SolarDayTimes {
  const baseDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const { sunDeclin, eqOfTime } = calculateSolarDeclinationAndEoT(baseDay);

  // Meio-Dia Solar em minutos UTC
  const solarNoonMinutes = (720 - 4 * lon - eqOfTime + 1440) % 1440;

  // Ângulo Horário para Nascer/Pôr do Sol (Zenith 90.833° - inclui refração e semidiâmetro)
  const zenithSunrise = 90.833;
  const cosHASunrise =
    (Math.cos(degToRad(zenithSunrise)) - Math.sin(degToRad(lat)) * Math.sin(degToRad(sunDeclin))) /
    (Math.cos(degToRad(lat)) * Math.cos(degToRad(sunDeclin)));

  let haSunriseDeg = 90;
  if (cosHASunrise >= 1) {
    haSunriseDeg = 0; // Noite polar
  } else if (cosHASunrise <= -1) {
    haSunriseDeg = 180; // Sol da meia-noite
  } else {
    haSunriseDeg = radToDeg(Math.acos(cosHASunrise));
  }

  // Ângulo Horário para Crepúsculo Civil (Zenith 96°)
  const zenithCivil = 96.0;
  const cosHACivil =
    (Math.cos(degToRad(zenithCivil)) - Math.sin(degToRad(lat)) * Math.sin(degToRad(sunDeclin))) /
    (Math.cos(degToRad(lat)) * Math.cos(degToRad(sunDeclin)));

  let haCivilDeg = 100;
  if (cosHACivil >= 1) {
    haCivilDeg = 0;
  } else if (cosHACivil <= -1) {
    haCivilDeg = 180;
  } else {
    haCivilDeg = radToDeg(Math.acos(cosHACivil));
  }

  const sunriseMinutes = solarNoonMinutes - haSunriseDeg * 4;
  const sunsetMinutes = solarNoonMinutes + haSunriseDeg * 4;
  const dawnMinutes = solarNoonMinutes - haCivilDeg * 4;
  const duskMinutes = solarNoonMinutes + haCivilDeg * 4;

  const startOfDayMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);

  return {
    sunrise: new Date(startOfDayMs + sunriseMinutes * 60000),
    sunset: new Date(startOfDayMs + sunsetMinutes * 60000),
    solarNoon: new Date(startOfDayMs + solarNoonMinutes * 60000),
    dawn: new Date(startOfDayMs + dawnMinutes * 60000),
    dusk: new Date(startOfDayMs + duskMinutes * 60000),
    daylightMinutes: Math.round(haSunriseDeg * 8),
  };
}

/**
 * Recomenda o tempo ideal de exposição solar matinal com base no ângulo e cobertura
 */
export function getRecommendedLightExposureMinutes(
  elevationDeg: number,
  skyCondition: 'direct_sun' | 'cloudy' | 'window' = 'direct_sun'
): { recommendedMinutes: number; rationale: string; luxEstimate: number } {
  if (skyCondition === 'window') {
    return {
      recommendedMinutes: 60,
      rationale: 'O vidro filtra até 80-90% dos fotões azuis necessários para ativar o SCN. Ideal sair para o exterior.',
      luxEstimate: 1000,
    };
  }

  if (skyCondition === 'cloudy') {
    return {
      recommendedMinutes: 20,
      rationale: 'Mesmo com nuvens, a luz difusa exterior tem >10.000 lux, suficiente para sincronizar o ritmo.',
      luxEstimate: 10000,
    };
  }

  if (elevationDeg < 5) {
    return {
      recommendedMinutes: 25,
      rationale: 'Sol muito baixo no horizonte. Exposição mais longa necessária para atingir a dose fotónica alvo.',
      luxEstimate: 5000,
    };
  }

  return {
    recommendedMinutes: 10,
    rationale: 'Céu limpo com elevação solar ideal. 10 minutos bastam para disparar o pico matinal de cortisol.',
    luxEstimate: 50000,
  };
}
