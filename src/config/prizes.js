// ============================================================================
// CONFIGURACIÓN DE PREMIOS — Ítalo Ruleta
// ============================================================================
// Este es el ÚNICO archivo que necesitas editar para cambiar premios, textos,
// probabilidades o los links de reseña/Instagram. No toques el resto del código.
//
// CÓMO FUNCIONA EL SISTEMA DE DOS CAPAS:
//   1. "weight" (peso) → determina la PROBABILIDAD REAL de ganar ese premio.
//      Es un sorteo ponderado sobre la suma total de todos los pesos.
//      Ej: si un premio tiene weight 100 sobre un total de 300, tiene 1/3 de
//      probabilidad real de salir, sin importar qué tan grande se vea en la rueda.
//   2. "angle" (ángulo visual) → determina qué tan GRANDE se dibuja la rebanada
//      en la rueda. Se usa SOLO para que los premios raros (peso bajo) sigan
//      siendo legibles visualmente. La suma de todos los "angle" debe dar 360.
//
// Para cambiar la probabilidad de un premio: edita su "weight".
// Para cambiar qué tan grande se ve la rebanada: edita su "angle" (sin que
// se salga de la suma de 360 entre todos).
// ============================================================================

// Links para los códigos QR pasivos que aparecen después del premio.
// Reemplaza estos placeholders con tus links reales.
export const GOOGLE_REVIEW_URL = 'https://g.page/r/PLACEHOLDER_GOOGLE_REVIEW/review'
export const INSTAGRAM_URL = 'https://instagram.com/italogelateria'

// Segundos que la pantalla de resultado permanece visible antes de resetear
// automáticamente para el siguiente cliente.
export const AUTO_RESET_SECONDS = 12

// Segundos que tarda la animación de giro (varias vueltas completas).
export const SPIN_DURATION_SECONDS = 5

// Segundos después de mostrar el premio en que aparece la tarjeta pasiva de QR.
export const QR_CARD_DELAY_SECONDS = 2.5

// ============================================================================
// TABLA DE PREMIOS
// ============================================================================
export const PRIZES = [
  {
    id: 'cafe',
    label: 'Café de la casa',
    description: 'Un café preparado por nuestro barista, cortesía de Ítalo.',
    redeemText: 'Muestra esta pantalla en caja para tu café.',
    icon: '☕',
    color: 'var(--coffee)', // café — marrón
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 100, // 1 de cada 3
    angle: 70,
  },
  {
    id: 'pan',
    label: 'Pan o galleta de avena',
    description: 'Un pan o galleta de avena recién horneado, para acompañar.',
    redeemText: 'Muestra esta pantalla en caja para tu pan o galleta.',
    icon: '🍪',
    color: 'var(--terracotta)', // pan/galleta — ladrillo
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 100, // 1 de cada 3
    angle: 70,
  },
  {
    id: 'sigue-1',
    label: 'Sigue participando',
    description: 'Esta vez no, ¡pero vuelve pronto a intentarlo de nuevo!',
    redeemText: '',
    icon: '🍦',
    color: 'var(--charcoal)', // sigue participando — neutro
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: false,
    weight: 39,
    angle: 55,
  },
  {
    id: 'pistacho',
    label: 'Crema de pistacho dulce',
    description: 'Una porción de nuestra crema de pistacho dulce, la favorita de la casa.',
    redeemText: 'Muestra esta pantalla en caja para tu crema de pistacho.',
    icon: '🥜',
    color: 'var(--green-deep)', // pistacho — verde profundo
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 15, // 1 de cada 20
    angle: 60,
  },
  {
    id: 'sigue-2',
    label: 'Sigue participando',
    description: 'Esta vez no, ¡pero vuelve pronto a intentarlo de nuevo!',
    redeemText: '',
    icon: '🍨',
    color: 'var(--charcoal-2)', // sigue participando — neutro
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: false,
    weight: 40,
    angle: 55,
  },
  {
    id: 'estrella',
    label: 'Premio Estrella',
    description: 'Mini Copa Sorpresa — una bola de gelato del sabor del día, ¡de regalo!',
    redeemText: 'Muestra esta pantalla en caja para tu Mini Copa Sorpresa.',
    icon: '⭐',
    color: 'var(--green)', // premio estrella — verde de marca, el más llamativo
    textColor: 'var(--ink)', // rebanada clara → texto oscuro
    isWin: true,
    weight: 6, // 1 de cada 50
    angle: 50,
  },
]

// Verificación de integridad en desarrollo: alerta temprano si alguien edita
// la tabla y los ángulos dejan de sumar 360°.
const totalAngle = PRIZES.reduce((sum, p) => sum + p.angle, 0)
if (import.meta.env.DEV && totalAngle !== 360) {
  console.warn(
    `[prizes.js] La suma de los ángulos visuales es ${totalAngle}°, debería ser 360°. Revisa la tabla PRIZES.`
  )
}

export const TOTAL_WEIGHT = PRIZES.reduce((sum, p) => sum + p.weight, 0)
