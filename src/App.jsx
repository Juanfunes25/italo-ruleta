import { useCallback, useEffect, useRef, useState } from 'react'
import Wheel from './components/Wheel.jsx'
import ResultCard from './components/ResultCard.jsx'
import StaffPanel from './components/StaffPanel.jsx'
import { useStats } from './hooks/useStats.js'
import { AUTO_RESET_SECONDS, QR_CARD_DELAY_SECONDS } from './config/prizes.js'
import './App.css'

const TAPS_TO_OPEN_STAFF = 5
const TAP_WINDOW_MS = 2500

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | spinning | result
  const [prize, setPrize] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS)
  const [showQr, setShowQr] = useState(false)
  const [staffOpen, setStaffOpen] = useState(false)

  const { counts, totalSpins, recordSpin, resetToday } = useStats()

  const tapTimesRef = useRef([])
  const qrTimerRef = useRef(null)
  const countdownRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    qrTimerRef.current = null
    countdownRef.current = null
  }, [])

  const resetToIdle = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setPrize(null)
    setShowQr(false)
    setSecondsLeft(AUTO_RESET_SECONDS)
  }, [clearTimers])

  const handleSpinStart = useCallback(() => {
    setPhase('spinning')
  }, [])

  const handleResult = useCallback(
    (won) => {
      // Idempotente: si por algún motivo se dispara más de una vez para el
      // mismo giro, nunca deben quedar dos intervalos corriendo en paralelo
      // (eso haría que la cuenta regresiva avance el doble de rápido).
      clearTimers()
      setPrize(won)
      setPhase('result')
      setShowQr(false)
      setSecondsLeft(AUTO_RESET_SECONDS)
      recordSpin(won.id)

      qrTimerRef.current = setTimeout(() => setShowQr(true), QR_CARD_DELAY_SECONDS * 1000)

      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            resetToIdle()
            return AUTO_RESET_SECONDS
          }
          return s - 1
        })
      }, 1000)
    },
    [clearTimers, recordSpin, resetToIdle]
  )

  useEffect(() => clearTimers, [clearTimers])

  const handleWordmarkTap = () => {
    const now = Date.now()
    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t < TAP_WINDOW_MS)
    if (tapTimesRef.current.length >= TAPS_TO_OPEN_STAFF) {
      tapTimesRef.current = []
      setStaffOpen(true)
    }
  }

  return (
    <div className="app">
      <aside className="app__brand">
        <button type="button" className="app__wordmark" onClick={handleWordmarkTap} aria-label="Ítalo Gelateria">
          <span className="app__wordmark-italo">
            ITAL<span className="app__wordmark-o">O</span>
          </span>
          <span className="app__wordmark-gelateria">GELATERIA</span>
        </button>
        <p className="app__instruction">
          {phase === 'idle' ? 'Toca la rueda para girar' : phase === 'spinning' ? 'Girando…' : '¡Gracias por participar!'}
        </p>
        {phase === 'idle' && <p className="app__disclaimer">Participa por la compra mínima</p>}
      </aside>

      <main className="app__wheel-area">
        <Wheel canSpin={phase === 'idle'} onSpinStart={handleSpinStart} onResult={handleResult} />
      </main>

      {phase === 'result' && prize && (
        <ResultCard prize={prize} secondsLeft={secondsLeft} showQr={showQr} onDone={resetToIdle} />
      )}

      {staffOpen && (
        <StaffPanel
          counts={counts}
          totalSpins={totalSpins}
          onReset={resetToday}
          onClose={() => setStaffOpen(false)}
        />
      )}
    </div>
  )
}
