import { useCallback, useEffect, useRef, useState } from 'react'
import Wheel from './components/Wheel.jsx'
import BranchesScreen from './components/BranchesScreen.jsx'
import ResultCard from './components/ResultCard.jsx'
import StaffPanel from './components/StaffPanel.jsx'
import { useStats } from './hooks/useStats.js'
import { AUTO_RESET_SECONDS, BRANCHES_SCREEN_SECONDS } from './config/prizes.js'
import './App.css'

const TAPS_TO_OPEN_STAFF = 5
const TAP_WINDOW_MS = 2500

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | spinning | branches | result
  const [prize, setPrize] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS)
  const [staffOpen, setStaffOpen] = useState(false)

  const { counts, totalSpins, recordSpin, resetToday } = useStats()

  const tapTimesRef = useRef([])
  const pendingPrizeRef = useRef(null)
  const branchesTimerRef = useRef(null)
  const countdownRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (branchesTimerRef.current) clearTimeout(branchesTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    branchesTimerRef.current = null
    countdownRef.current = null
  }, [])

  const resetToIdle = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setPrize(null)
    pendingPrizeRef.current = null
    setSecondsLeft(AUTO_RESET_SECONDS)
  }, [clearTimers])

  const handleSpinStart = useCallback(() => {
    setPhase('spinning')
  }, [])

  // La rueda ya se detuvo y sabe qué premio salió, pero primero se muestra la
  // pantalla de sucursales unos segundos antes de revelar el premio.
  const handleSpinDone = useCallback(
    (won) => {
      // Idempotente: si por algún motivo se dispara más de una vez para el
      // mismo giro, nunca debe quedar más de un temporizador corriendo.
      clearTimers()
      pendingPrizeRef.current = won
      setPhase('branches')

      branchesTimerRef.current = setTimeout(() => {
        const revealed = pendingPrizeRef.current
        pendingPrizeRef.current = null
        setPrize(revealed)
        setPhase('result')
        setSecondsLeft(AUTO_RESET_SECONDS)
        recordSpin(revealed.id)

        // El updater de setSecondsLeft solo calcula el siguiente número — nunca
        // debe disparar efectos secundarios (React puede invocarlo más de una
        // vez). El reseteo a 'idle' se maneja aparte, en el useEffect de abajo.
        countdownRef.current = setInterval(() => {
          setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
        }, 1000)
      }, BRANCHES_SCREEN_SECONDS * 1000)
    },
    [clearTimers, recordSpin]
  )

  // Cuando la cuenta regresiva llega a 0 en la pantalla de resultado, resetea.
  useEffect(() => {
    if (phase === 'result' && secondsLeft === 0) {
      resetToIdle()
    }
  }, [phase, secondsLeft, resetToIdle])

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
          {phase === 'idle'
            ? 'Toca la rueda para girar'
            : phase === 'spinning'
              ? 'Girando…'
              : phase === 'branches'
                ? '¡Ya casi!'
                : '¡Gracias por participar!'}
        </p>
        {phase === 'idle' && <p className="app__disclaimer">Participa por la compra mínima</p>}
      </aside>

      <main className="app__wheel-area">
        <Wheel canSpin={phase === 'idle'} onSpinStart={handleSpinStart} onResult={handleSpinDone} />
      </main>

      {phase === 'branches' && <BranchesScreen />}

      {phase === 'result' && prize && <ResultCard prize={prize} secondsLeft={secondsLeft} onDone={resetToIdle} />}

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
