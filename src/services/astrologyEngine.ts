/**
 * Vishakha_ASTRA - High-Precision Astrological Calculation Engine
 * 
 * Powered by astronomy-engine (NASA JPL DE405-grade geocentric positions)
 * Combined with Chitrapaksha / Lahiri Sidereal Zodiac (Nirayana) & Jaimini 7 Chara Karakas.
 */

import * as Astronomy from 'astronomy-engine';

export interface PlanetaryPosition {
  name: string;
  symbol: string;
  longitude: number; // 0 to 360 degrees sidereal
  signIndex: number; // 0 (Aries) to 11 (Pisces)
  signName: string;
  degreeInSign: number; // 0 to 30 degrees
  degreeFormatted: string; // e.g. "19° 37' 42\""
  nakshatra: string;
  nakshatraIndex: number; // 1 to 27
  pada: number; // 1 to 4
  house: number; // 1 to 12 from Ascendant
  isRetrograde: boolean;
}

export interface CharaKarakaAssignment {
  karakaRole: 'Atmakaraka' | 'Amatyakaraka' | 'Bhratrikaraka' | 'Matrikaraka' | 'Putrakaraka' | 'Gnatikaraka' | 'Darakaraka';
  abbreviation: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  planetName: string;
  symbol: string;
  degreeInSign: number;
  degreeFormatted: string;
  signName: string;
  house: number;
  nakshatra: string;
  pada: number;
  significator: string;
  classicalPrinciple: string;
}

export interface HoroscopeCalculationResult {
  ascendant: PlanetaryPosition;
  planets: PlanetaryPosition[];
  charaKarakas: CharaKarakaAssignment[];
  houses: { [houseNum: number]: PlanetaryPosition[] };
  signs: { [signIndex: number]: PlanetaryPosition[] };
  ayanamsa: number;
  ayanamsaFormatted: string;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function formatDegMinSec(degFloat: number): string {
  const d = Math.floor(degFloat);
  const m = Math.floor((degFloat - d) * 60);
  const s = Math.floor(((degFloat - d) * 60 - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export function calculateHoroscope(
  birthDate: string, // YYYY-MM-DD
  birthTime: string, // HH:MM (24-hour)
  latitude: number,
  longitude: number,
  utcOffsetHours: number
): HoroscopeCalculationResult {
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const [hourStr, minStr] = birthTime.split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const localHour = parseInt(hourStr, 10);
  const localMinute = parseInt(minStr, 10);

  // Compute Universal Time (UT)
  const totalLocalMinutes = localHour * 60 + localMinute;
  const totalUtMinutes = totalLocalMinutes - Math.round(utcOffsetHours * 60);
  
  // Create UTC Date object
  const utDate = new Date(Date.UTC(year, month - 1, day, 0, totalUtMinutes, 0));
  const astroTime = new Astronomy.AstroTime(utDate);

  // High Precision Lahiri (Chitrapaksha) Ayanamsa:
  // J2000.0 epoch value: 23° 51' 25.532" = 23.857092°
  // Precession rate: 50.290966" per year = 50.290966 / 3600 deg / year
  // astroTime.ut is days from J2000.0 (January 1, 2000 at 12:00 UT)
  const centuriesSinceJ2000 = astroTime.ut / 36525.0;
  const lahiriAyanamsa = 23.857092 + (centuriesSinceJ2000 * 100.0 * (50.290966 / 3600.0));

  // -------------------------------------------------------------
  // PRECISE ASCENDANT (LAGNA) CALCULATION
  // 1. Greenwich Mean Sidereal Time (GMST) from Astronomy Engine
  // 2. RAMC = GMST (in degrees) + Geographic Longitude
  // 3. True Obliquity of Ecliptic
  // 4. Ascendant = atan2(cos(RAMC), -sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  // -------------------------------------------------------------
  const gmstHours = Astronomy.SiderealTime(astroTime);
  const gmstDeg = (gmstHours * 15.0) % 360.0;
  const ramc = normalizeDeg(gmstDeg + longitude);

  const T = centuriesSinceJ2000;
  const eps = (23.43929111 - (46.8150 * T) / 3600.0) * D2R;
  const ramcRad = ramc * D2R;
  const latRad = latitude * D2R;

  const yAsc = Math.cos(ramcRad);
  const xAsc = -Math.sin(ramcRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
  const lagnaTrop = normalizeDeg(Math.atan2(yAsc, xAsc) * R2D);
  const lagnaSidereal = normalizeDeg(lagnaTrop - lahiriAyanamsa);
  const ascSignIndex = Math.floor(lagnaSidereal / 30);

  function createPlanetRecord(name: string, symbol: string, siderealLong: number, isRetro: boolean = false): PlanetaryPosition {
    const normLong = normalizeDeg(siderealLong);
    const signIdx = Math.floor(normLong / 30);
    const degInSign = normLong % 30;
    const nakshatraIndex = Math.floor(normLong / (360 / 27)) + 1;
    const pada = Math.floor((normLong % (360 / 27)) / (360 / 108)) + 1;
    
    let house = signIdx - ascSignIndex + 1;
    if (house <= 0) house += 12;

    return {
      name,
      symbol,
      longitude: parseFloat(normLong.toFixed(4)),
      signIndex: signIdx,
      signName: ZODIAC_SIGNS[signIdx],
      degreeInSign: parseFloat(degInSign.toFixed(4)),
      degreeFormatted: formatDegMinSec(degInSign),
      nakshatra: NAKSHATRAS[nakshatraIndex - 1] || 'Ashwini',
      nakshatraIndex,
      pada,
      house,
      isRetrograde: isRetro,
    };
  }

  const ascRecord = createPlanetRecord('Ascendant', 'Asc', lagnaSidereal);

  // Compute 7 Classical Planets using NASA-grade Astronomy Engine geocentric vectors
  const classicalBodies: Array<{ name: string; symbol: string; body: Astronomy.Body }> = [
    { name: 'Sun', symbol: 'Su', body: Astronomy.Body.Sun },
    { name: 'Moon', symbol: 'Mo', body: Astronomy.Body.Moon },
    { name: 'Mars', symbol: 'Ma', body: Astronomy.Body.Mars },
    { name: 'Mercury', symbol: 'Me', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', symbol: 'Ju', body: Astronomy.Body.Jupiter },
    { name: 'Venus', symbol: 'Ve', body: Astronomy.Body.Venus },
    { name: 'Saturn', symbol: 'Sa', body: Astronomy.Body.Saturn },
  ];

  const calculatedClassicalPlanets = classicalBodies.map(({ name, symbol, body }) => {
    const geoVec = Astronomy.GeoVector(body, astroTime, true);
    const ecl = Astronomy.Ecliptic(geoVec);
    const siderealDeg = normalizeDeg(ecl.elon - lahiriAyanamsa);
    
    // Check retrograde status by checking motion over a small 1-hour interval
    let isRetro = false;
    if (name !== 'Sun' && name !== 'Moon') {
      const futureTime = new Astronomy.AstroTime(new Date(utDate.getTime() + 3600000));
      const futureVec = Astronomy.GeoVector(body, futureTime, true);
      const futureEcl = Astronomy.Ecliptic(futureVec);
      let diff = futureEcl.elon - ecl.elon;
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;
      isRetro = diff < 0;
    }

    return createPlanetRecord(name, symbol, siderealDeg, isRetro);
  });

  // Accurate Rahu (Mean Lunar Node) and Ketu
  // Formula for Mean Ascending Lunar Node (IAU standard):
  const omega = normalizeDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
  const rahuSidereal = normalizeDeg(omega - lahiriAyanamsa);
  const ketuSidereal = normalizeDeg(rahuSidereal + 180.0);

  const rahuRecord = createPlanetRecord('Rahu', 'Ra', rahuSidereal, true);
  const ketuRecord = createPlanetRecord('Ketu', 'Ke', ketuSidereal, true);

  const allPlanets: PlanetaryPosition[] = [
    ...calculatedClassicalPlanets,
    rahuRecord,
    ketuRecord,
  ];

  // -------------------------------------------------------------
  // JAIMINI 7 CHARA KARAKA SYSTEM (Strict Rule: Exclude Rahu & Ketu)
  // -------------------------------------------------------------
  // Sort strictly descending by degree within sign (30° down to 0°)
  const sortedByDegree = [...calculatedClassicalPlanets].sort((a, b) => {
    if (Math.abs(b.degreeInSign - a.degreeInSign) > 0.00001) {
      return b.degreeInSign - a.degreeInSign;
    }
    return b.longitude - a.longitude;
  });

  const karakaDefinitions: Array<{
    role: CharaKarakaAssignment['karakaRole'];
    abbr: CharaKarakaAssignment['abbreviation'];
    significator: string;
    principle: string;
  }> = [
    {
      role: 'Atmakaraka',
      abbr: 'AK',
      significator: "Soul's Purpose & Core Self",
      principle: 'Highest degree planet representing true soul identity, moral dignity, and primary spiritual mission.',
    },
    {
      role: 'Amatyakaraka',
      abbr: 'AmK',
      significator: 'Career, Intellect & Status',
      principle: 'Second highest planet acting as chief minister to the soul, governing profession, mind, and execution.',
    },
    {
      role: 'Bhratrikaraka',
      abbr: 'BK',
      significator: 'Courage, Siblings & Mentors',
      principle: 'Third highest planet governing courage, younger siblings, camaraderie, and guiding teachers.',
    },
    {
      role: 'Matrikaraka',
      abbr: 'MK',
      significator: 'Home, Mother & Emotional Grounding',
      principle: 'Fourth highest planet signifying mother, domestic sanctuaries, vehicles, and peace of mind.',
    },
    {
      role: 'Putrakaraka',
      abbr: 'PK',
      significator: 'Creativity, Progeny & Intellect',
      principle: 'Fifth highest planet governing children, higher scholarship, creative genius, and spiritual discernment.',
    },
    {
      role: 'Gnatikaraka',
      abbr: 'GK',
      significator: 'Obstacles, Competition & Life Lessons',
      principle: 'Sixth highest planet representing tests, rivals, disputes, health vulnerabilities, and resilience.',
    },
    {
      role: 'Darakaraka',
      abbr: 'DK',
      significator: 'Spouse, Marriage & Partnerships',
      principle: 'Lowest degree planet signifying life partner, romantic union, intimacy, and long-term business contracts.',
    },
  ];

  const charaKarakas: CharaKarakaAssignment[] = sortedByDegree.map((planet, index) => {
    const def = karakaDefinitions[index];
    return {
      karakaRole: def.role,
      abbreviation: def.abbr,
      planetName: planet.name,
      symbol: planet.symbol,
      degreeInSign: planet.degreeInSign,
      degreeFormatted: planet.degreeFormatted,
      signName: planet.signName,
      house: planet.house,
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      significator: def.significator,
      classicalPrinciple: def.principle,
    };
  });

  // Houses Mapping
  const housesMap: { [h: number]: PlanetaryPosition[] } = {};
  for (let h = 1; h <= 12; h++) housesMap[h] = [];
  allPlanets.forEach((p) => {
    housesMap[p.house].push(p);
  });

  // Signs Mapping
  const signsMap: { [s: number]: PlanetaryPosition[] } = {};
  for (let s = 0; s < 12; s++) signsMap[s] = [];
  allPlanets.forEach((p) => {
    signsMap[p.signIndex].push(p);
  });

  return {
    ascendant: ascRecord,
    planets: allPlanets,
    charaKarakas,
    houses: housesMap,
    signs: signsMap,
    ayanamsa: parseFloat(lahiriAyanamsa.toFixed(4)),
    ayanamsaFormatted: formatDegMinSec(lahiriAyanamsa),
  };
}
