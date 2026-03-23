/**
 * ChinaCars Score — composite 0-100 rating for each vehicle.
 *
 * The score is computed relative to ALL models in the database,
 * so a car's score reflects how it compares to its peers.
 *
 * Categories:
 *  - Value (25%):         Price competitiveness per HP and per km range
 *  - Range (20%):         WLTP range for EV/PHEV; inverted fuel consumption for ICE/HEV
 *  - Performance (15%):   Power, acceleration, top speed
 *  - Safety (15%):        NCAP stars, EU homologation, warranty
 *  - Practicality (15%):  Trunk, seats, wheelbase
 *  - Charging (10%):      DC charge power, charge time
 */

export interface ScoreBreakdown {
  overall: number;        // 0–100
  value: number;          // 0–100
  range: number;          // 0–100
  performance: number;    // 0–100
  safety: number;         // 0–100
  practicality: number;   // 0–100
  charging: number;       // 0–100
}

interface ModelData {
  id: number;
  priceEurFrom: number | null;
  powerHp: number | null;
  rangeWltpKm: number | null;
  acceleration0100: string | null;
  topSpeedKmh: number | null;
  ncapStars: number | null;
  euHomologated: boolean | null;
  warrantyYears: number | null;
  warrantyKm: number | null;
  trunkLiters: number | null;
  seats: number | null;
  wheelbaseMm: number | null;
  chargePowerDcKw: string | null;
  chargeTimeDcMin: number | null;
  propulsion: string | null;
}

// Normalize a value to 0–100 within a [min, max] range
function normalize(value: number | null, min: number, max: number): number {
  if (value == null || max === min) return 50; // default to midpoint if unknown
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// Inverse normalize (lower is better — e.g., price, charge time)
function normalizeInverse(value: number | null, min: number, max: number): number {
  if (value == null || max === min) return 50;
  return Math.max(0, Math.min(100, ((max - value) / (max - min)) * 100));
}

export function computeScores(allModels: ModelData[]): Map<number, ScoreBreakdown> {
  const scores = new Map<number, ScoreBreakdown>();

  // ─── Compute ranges across all models for normalization ─────────────

  const prices = allModels.map((m) => m.priceEurFrom).filter((v): v is number => v != null);
  const powers = allModels.map((m) => m.powerHp).filter((v): v is number => v != null);
  const ranges = allModels.map((m) => m.rangeWltpKm).filter((v): v is number => v != null);
  const accels = allModels.map((m) => parseFloat(m.acceleration0100 || '')).filter((v) => !isNaN(v));
  const speeds = allModels.map((m) => m.topSpeedKmh).filter((v): v is number => v != null);
  const trunks = allModels.map((m) => m.trunkLiters).filter((v): v is number => v != null);
  const wheelbases = allModels.map((m) => m.wheelbaseMm).filter((v): v is number => v != null);
  const dcPowers = allModels.map((m) => parseFloat(m.chargePowerDcKw || '')).filter((v) => !isNaN(v));
  const dcTimes = allModels.map((m) => m.chargeTimeDcMin).filter((v): v is number => v != null);
  const warranties = allModels.map((m) => m.warrantyYears).filter((v): v is number => v != null);

  const minMax = (arr: number[]): [number, number] =>
    arr.length ? [Math.min(...arr), Math.max(...arr)] : [0, 100];

  const [priceMin, priceMax] = minMax(prices);
  const [powerMin, powerMax] = minMax(powers);
  const [rangeMin, rangeMax] = minMax(ranges);
  const [accelMin, accelMax] = minMax(accels);     // lower is better
  const [speedMin, speedMax] = minMax(speeds);
  const [trunkMin, trunkMax] = minMax(trunks);
  const [wbMin, wbMax] = minMax(wheelbases);
  const [dcPwrMin, dcPwrMax] = minMax(dcPowers);
  const [dcTimeMin, dcTimeMax] = minMax(dcTimes);  // lower is better
  const [warMin, warMax] = minMax(warranties);

  // ─── Compute €/HP and €/km ratios for value scoring ─────────────────

  const eurPerHp = allModels
    .filter((m) => m.priceEurFrom && m.powerHp)
    .map((m) => m.priceEurFrom! / m.powerHp!);
  const [ephMin, ephMax] = minMax(eurPerHp);

  const eurPerKm = allModels
    .filter((m) => m.priceEurFrom && m.rangeWltpKm && m.rangeWltpKm > 0)
    .map((m) => m.priceEurFrom! / m.rangeWltpKm!);
  const [epkMin, epkMax] = minMax(eurPerKm);

  // ─── Score each model ───────────────────────────────────────────────

  for (const m of allModels) {
    // ── Value (25%) ──
    let valueScore = 50;
    const parts: number[] = [];

    // Price per HP (lower = better value)
    if (m.priceEurFrom && m.powerHp) {
      parts.push(normalizeInverse(m.priceEurFrom / m.powerHp, ephMin, ephMax));
    }
    // Price per km range (lower = better value, only for cars with range)
    if (m.priceEurFrom && m.rangeWltpKm && m.rangeWltpKm > 0) {
      parts.push(normalizeInverse(m.priceEurFrom / m.rangeWltpKm, epkMin, epkMax));
    }
    // Absolute price (lower = more accessible)
    if (m.priceEurFrom) {
      parts.push(normalizeInverse(m.priceEurFrom, priceMin, priceMax));
    }

    if (parts.length > 0) {
      valueScore = parts.reduce((a, b) => a + b, 0) / parts.length;
    }

    // ── Range & Efficiency (20%) ──
    let rangeScore = 40; // default for ICE
    if (m.propulsion === 'BEV' || m.propulsion === 'PHEV') {
      rangeScore = normalize(m.rangeWltpKm, rangeMin, rangeMax);
      // PHEV typically has lower EV range, so boost score to be fair
      if (m.propulsion === 'PHEV' && m.rangeWltpKm && m.rangeWltpKm < 150) {
        rangeScore = Math.min(100, rangeScore + 25);
      }
    } else if (m.propulsion === 'HEV') {
      rangeScore = 55; // hybrids get moderate score (good efficiency)
    }
    // ICE stays at 40

    // ── Performance (15%) ──
    const perfParts: number[] = [];
    if (m.powerHp) perfParts.push(normalize(m.powerHp, powerMin, powerMax));
    if (m.acceleration0100) {
      const accel = parseFloat(m.acceleration0100);
      if (!isNaN(accel)) perfParts.push(normalizeInverse(accel, accelMin, accelMax));
    }
    if (m.topSpeedKmh) perfParts.push(normalize(m.topSpeedKmh, speedMin, speedMax));
    const performanceScore = perfParts.length > 0
      ? perfParts.reduce((a, b) => a + b, 0) / perfParts.length
      : 50;

    // ── Safety (15%) ──
    const safetyParts: number[] = [];
    // NCAP is heavily weighted — 5 stars = 100, 4 = 80, 3 = 55, null = 40
    if (m.ncapStars != null) {
      safetyParts.push(m.ncapStars === 5 ? 100 : m.ncapStars === 4 ? 80 : m.ncapStars * 18);
    } else {
      safetyParts.push(40);
    }
    // EU homologation bonus
    safetyParts.push(m.euHomologated ? 100 : 30);
    // Warranty
    if (m.warrantyYears) {
      safetyParts.push(normalize(m.warrantyYears, warMin, warMax));
    }
    const safetyScore = safetyParts.reduce((a, b) => a + b, 0) / safetyParts.length;

    // ── Practicality (15%) ──
    const practParts: number[] = [];
    if (m.trunkLiters) practParts.push(normalize(m.trunkLiters, trunkMin, trunkMax));
    if (m.seats) {
      // 5 seats = good (70), 7 = excellent (100), 4 = ok (50)
      practParts.push(m.seats >= 7 ? 100 : m.seats >= 5 ? 70 : m.seats >= 4 ? 50 : 30);
    }
    if (m.wheelbaseMm) practParts.push(normalize(m.wheelbaseMm, wbMin, wbMax));
    const practicalityScore = practParts.length > 0
      ? practParts.reduce((a, b) => a + b, 0) / practParts.length
      : 50;

    // ── Charging (10%) ──
    let chargingScore = 30; // default for non-EV
    if (m.propulsion === 'BEV' || m.propulsion === 'PHEV') {
      const chargeParts: number[] = [];
      const dcKw = parseFloat(m.chargePowerDcKw || '');
      if (!isNaN(dcKw)) chargeParts.push(normalize(dcKw, dcPwrMin, dcPwrMax));
      if (m.chargeTimeDcMin) chargeParts.push(normalizeInverse(m.chargeTimeDcMin, dcTimeMin, dcTimeMax));
      if (chargeParts.length > 0) {
        chargingScore = chargeParts.reduce((a, b) => a + b, 0) / chargeParts.length;
      } else {
        chargingScore = 40;
      }
    } else if (m.propulsion === 'HEV') {
      chargingScore = 50; // self-charging = decent
    }
    // ICE stays at 30

    // ── Overall (weighted) ──
    const overall =
      valueScore * 0.25 +
      rangeScore * 0.20 +
      performanceScore * 0.15 +
      safetyScore * 0.15 +
      practicalityScore * 0.15 +
      chargingScore * 0.10;

    scores.set(m.id, {
      overall: Math.round(overall),
      value: Math.round(valueScore),
      range: Math.round(rangeScore),
      performance: Math.round(performanceScore),
      safety: Math.round(safetyScore),
      practicality: Math.round(practicalityScore),
      charging: Math.round(chargingScore),
    });
  }

  return scores;
}
