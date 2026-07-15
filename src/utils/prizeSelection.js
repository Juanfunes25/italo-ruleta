// Lógica pura (sin React) de sorteo ponderado y geometría de la rueda.
// Separada de la UI para que las probabilidades sean fáciles de verificar y testear.

import { PRIZES, TOTAL_WEIGHT } from '../config/prizes.js'

// Sortea un premio respetando exactamente los pesos de PRIZES (independiente
// de qué tan grande se vea cada rebanada en la rueda).
export function pickWeightedPrize(random = Math.random) {
  let roll = random() * TOTAL_WEIGHT
  for (const prize of PRIZES) {
    roll -= prize.weight
    if (roll < 0) return prize
  }
  // Fallback numérico por redondeo de punto flotante.
  return PRIZES[PRIZES.length - 1]
}

// Calcula el rango angular [start, end) de cada premio en la rueda, en el
// orden en que aparecen en PRIZES, empezando en 0° (arriba) en sentido horario.
export function getSliceRanges() {
  let cursor = 0
  return PRIZES.map((prize) => {
    const start = cursor
    const end = cursor + prize.angle
    cursor = end
    return { prize, start, end }
  })
}

// Devuelve un ángulo aleatorio dentro de la rebanada de un premio, evitando
// caer justo en el borde (para que se note claramente en qué casilla cayó).
export function getRandomAngleWithinSlice(start, end, random = Math.random) {
  const margin = Math.min((end - start) * 0.18, 6)
  const usableStart = start + margin
  const usableEnd = end - margin
  return usableStart + random() * (usableEnd - usableStart)
}

// Dado un premio ganador y la rotación acumulada previa de la rueda, calcula
// la rotación final (en grados, siempre mayor a la previa) para que la
// rebanada de ese premio quede bajo el puntero fijo de arriba, con varias
// vueltas completas de por medio.
export function computeTargetRotation(prize, previousRotation, extraTurns = 5, random = Math.random) {
  const ranges = getSliceRanges()
  const range = ranges.find((r) => r.prize.id === prize.id)
  const landingAngle = getRandomAngleWithinSlice(range.start, range.end, random)

  // La rueda gira en sentido horario; el puntero está fijo arriba (0°).
  // Necesitamos que (landingAngle + rotation) mod 360 === 0.
  const currentMod = ((previousRotation % 360) + 360) % 360
  let delta = (360 - landingAngle - currentMod) % 360
  if (delta < 0) delta += 360

  return previousRotation + extraTurns * 360 + delta
}
