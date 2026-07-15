import { useCallback, useEffect, useRef, useState } from 'react'
import { PRIZES } from '../config/prizes.js'
import { computeTargetRotation, getSliceRanges, pickWeightedPrize } from '../utils/prizeSelection.js'
import { SPIN_DURATION_SECONDS } from '../config/prizes.js'
import './Wheel.css'

const SIZE = 620 // viewBox lógico; el CSS lo escala al tamaño real en pantalla
const CENTER = SIZE / 2
const WHEEL_RADIUS = 250
const LABEL_RADIUS = 178
const ICON_RADIUS = 208
const HUB_RADIUS = 78
const WAFER_INNER = 258
const WAFER_OUTER = 300
const WAFER_COUNT = 48

function toXY(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  }
}

function slicePath(start, end, radius) {
  const p0 = toXY(start, radius)
  const p1 = toXY(end, radius)
  const largeArc = end - start > 180 ? 1 : 0
  return `M ${CENTER},${CENTER} L ${p0.x},${p0.y} A ${radius},${radius} 0 ${largeArc} 1 ${p1.x},${p1.y} Z`
}

function waferTriangle(index) {
  const step = 360 / WAFER_COUNT
  const start = index * step
  const end = start + step
  const p0 = toXY(start, WAFER_INNER)
  const p1 = toXY(end, WAFER_INNER)
  const pTip = toXY((start + end) / 2, WAFER_OUTER)
  return `M ${p0.x},${p0.y} L ${pTip.x},${pTip.y} L ${p1.x},${p1.y} Z`
}

const sliceRanges = getSliceRanges()

export default function Wheel({ canSpin, onSpinStart, onResult }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const pendingPrizeRef = useRef(null)
  const settledRef = useRef(true)
  const settleTimerRef = useRef(null)

  // Resuelve el giro una sola vez, ya sea por transitionend (caso normal) o
  // por el timer de respaldo (si el navegador de la tablet no dispara el
  // evento, p. ej. si la pestaña estuvo un instante en segundo plano). Un
  // kiosco sin personal nunca debe quedar trabado en "girando…".
  const finishSpin = useCallback(() => {
    if (settledRef.current) return
    settledRef.current = true
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
    setSpinning(false)
    const prize = pendingPrizeRef.current
    pendingPrizeRef.current = null
    if (prize) onResult?.(prize)
  }, [onResult])

  useEffect(() => () => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
  }, [])

  const handleSpin = useCallback(() => {
    // Se consulta settledRef (no el estado `spinning`) para que el guard sea
    // síncrono: dos toques casi simultáneos no deben poder arrancar dos
    // giros antes de que React vuelva a renderizar.
    if (!canSpin || !settledRef.current) return
    const prize = pickWeightedPrize()
    pendingPrizeRef.current = prize
    const target = computeTargetRotation(prize, rotation)
    settledRef.current = false
    setSpinning(true)
    onSpinStart?.()
    setRotation(target)
    settleTimerRef.current = setTimeout(finishSpin, SPIN_DURATION_SECONDS * 1000 + 400)
  }, [canSpin, rotation, onSpinStart, finishSpin])

  const handleTransitionEnd = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
      finishSpin()
    },
    [finishSpin]
  )

  return (
    <div className="wheel-stage">
      <div className="wheel-pointer" aria-hidden="true" />
      <div className="wheel-frame">
        <div
          className="wheel-spin"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${SPIN_DURATION_SECONDS}s`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
        <svg className="wheel-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Anillo decorativo tipo barquillo: franjas triangulares doradas alternadas */}
          <g>
            {Array.from({ length: WAFER_COUNT }).map((_, i) => (
              <path
                key={i}
                d={waferTriangle(i)}
                fill={i % 2 === 0 ? 'var(--gold)' : 'var(--gold-light)'}
                stroke="var(--terracotta-dark)"
                strokeWidth="0.5"
              />
            ))}
          </g>
          <circle cx={CENTER} cy={CENTER} r={WHEEL_RADIUS + 6} fill="var(--cream)" stroke="var(--gold)" strokeWidth="4" />

          {/* Rebanadas de premios */}
          <g>
            {sliceRanges.map(({ prize, start, end }) => (
              <path
                key={prize.id}
                d={slicePath(start, end, WHEEL_RADIUS)}
                fill={prize.color}
                stroke="var(--cream)"
                strokeWidth="3"
              />
            ))}
          </g>

          {/* Íconos y etiquetas */}
          <g>
            {sliceRanges.map(({ prize, start, end }) => {
              const mid = (start + end) / 2
              const flip = mid > 90 && mid < 270
              const iconPos = toXY(mid, ICON_RADIUS)
              const labelPos = toXY(mid, LABEL_RADIUS)
              const rot = flip ? mid + 90 + 180 : mid + 90
              return (
                <g key={prize.id}>
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    fontSize="34"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {prize.icon}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fontSize="15"
                    fontFamily="var(--font-ui)"
                    fontWeight="800"
                    fill="var(--cream)"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${rot} ${labelPos.x} ${labelPos.y})`}
                  >
                    {prize.isWin ? prize.label : '¡Suerte!'}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
        </div>

        <button
          type="button"
          className={`wheel-hub ${!canSpin || spinning ? 'wheel-hub--disabled' : ''}`}
          style={{ width: `${((HUB_RADIUS * 2) / SIZE) * 100}%`, height: `${((HUB_RADIUS * 2) / SIZE) * 100}%` }}
          onClick={handleSpin}
          disabled={!canSpin || spinning}
          aria-label="Girar la ruleta de premios"
        >
          {spinning ? '...' : 'Gira'}
        </button>
      </div>
    </div>
  )
}

export const ALL_PRIZES = PRIZES
