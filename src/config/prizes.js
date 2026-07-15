// ============================================================================
// CONFIGURACIÓN DE PREMIOS — Ítalo Ruleta
// ============================================================================
// Este es el ÚNICO archivo que necesitas editar para cambiar premios, textos,
// probabilidades o los links de reseña/Instagram. No toques el resto del código.
//
// CÓMO FUNCIONA EL SISTEMA DE DOS CAPAS:
//   1. "weight" (peso) → determina la PROBABILIDAD REAL de ganar ese premio.
//      Es un sorteo ponderado sobre la suma total de todos los pesos.
//      Ej: si un premio tiene weight 100 sobre un total de 600, tiene 1/6 de
//      probabilidad real de salir, sin importar qué tan grande se vea en la rueda.
//   2. "angle" (ángulo visual) → determina qué tan GRANDE se dibuja la rebanada
//      en la rueda. Se usa SOLO para que los premios raros (peso bajo) sigan
//      siendo legibles visualmente. La suma de todos los "angle" debe dar 360.
//
// Para cambiar la probabilidad de un premio: edita su "weight".
// Para cambiar qué tan grande se ve la rebanada: edita su "angle" (sin que
// se salga de la suma de 360 entre todos).
//
// "wheelLabel" es el texto CORTO que se ve dentro de la rueda (junto al ícono
// de esa rebanada) — tiene que ser corto para no encimarse con el ícono.
// "label" es el nombre completo, se usa en la tarjeta de resultado al ganar.
// ============================================================================

// Links para los códigos QR pasivos que aparecen después del premio.
// Reemplaza estos placeholders con tus links reales.
export const GOOGLE_REVIEW_URL = 'https://g.page/r/PLACEHOLDER_GOOGLE_REVIEW/review'
export const INSTAGRAM_URL = 'https://instagram.com/italogelateria'

// Segundos que la pantalla de resultado permanece visible antes de resetear
// automáticamente para el siguiente cliente.
export const AUTO_RESET_SECONDS = 20

// Segundos que tarda la animación de giro (varias vueltas completas).
export const SPIN_DURATION_SECONDS = 5

// Segundos que se muestra la pantalla con el nombre de las 5 sucursales
// después de que la rueda se detiene y antes de revelar el premio.
export const BRANCHES_SCREEN_SECONDS = 4

// ============================================================================
// TABLA DE PREMIOS
// ============================================================================
export const PRIZES = [
  {
    id: 'cafe',
    label: 'Café de la casa',
    wheelLabel: 'Café', // texto corto que se muestra EN la rueda (el label completo se ve en la tarjeta de resultado)
    description: 'Un café preparado por nuestro barista, cortesía de Ítalo.',
    icon: '☕',
    color: 'var(--coffee)', // café — marrón
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 100, // 1 de cada 6
    angle: 60,
  },
  {
    id: 'pan',
    label: 'Pan o galleta de avena',
    wheelLabel: 'Pan/Galleta',
    description: 'Un pan o galleta de avena recién horneado, para acompañar.',
    icon: '🍪',
    color: 'var(--terracotta)', // pan/galleta — ladrillo
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 60, // 1 de cada 10
    angle: 60,
  },
  {
    id: 'sigue',
    label: 'Sigue participando',
    wheelLabel: '¡Suerte!',
    description: 'Esta vez no, ¡pero vuelve pronto a intentarlo de nuevo!',
    icon: '🍦',
    color: 'var(--charcoal)', // sigue participando — neutro
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: false,
    weight: 317,
    angle: 55,
  },
  {
    id: 'topping-pistacho',
    label: 'Topping de pistacho gratis',
    wheelLabel: 'Topping',
    description: 'Un topping de pistacho gratis para tu gelato.',
    icon: '🥜',
    color: 'var(--green-deep)', // topping de pistacho — verde profundo
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 60, // 1 de cada 10
    angle: 60,
  },
  {
    id: 'agranda-copa',
    label: 'Agranda tu copa gratis',
    wheelLabel: 'Agranda',
    description: 'Sube de tamaño tu copa sin costo extra.',
    icon: '🍨',
    color: 'var(--charcoal-2)', // agranda tu copa — neutro
    textColor: 'var(--cream)', // rebanada oscura → texto claro
    isWin: true,
    weight: 60, // 1 de cada 10
    angle: 60,
  },
  {
    id: 'estrella',
    label: 'Crema de pistacho',
    wheelLabel: 'Pistacho',
    description: 'Una porción de nuestra crema de pistacho dulce, la favorita de la casa.',
    icon: '⭐',
    color: 'var(--green)', // el premio más raro — verde de marca, el más llamativo
    textColor: 'var(--ink)', // rebanada clara → texto oscuro
    isWin: true,
    weight: 3, // 1 de cada 200
    angle: 65,
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
