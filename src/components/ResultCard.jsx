import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import ReviewQR from './ReviewQR.jsx'
import './ResultCard.css'

export default function ResultCard({ prize, secondsLeft, onDone }) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!prize?.isWin || firedRef.current) return
    firedRef.current = true
    const colors = ['#C5D288', '#3E5A34', '#FFFFFF', '#000000']
    confetti({ particleCount: 110, spread: 75, startVelocity: 45, origin: { y: 0.55 }, colors })
    const t = setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, startVelocity: 30, origin: { y: 0.5 }, colors })
    }, 350)
    return () => clearTimeout(t)
  }, [prize])

  if (!prize) return null

  return (
    <div className="result-overlay">
      <div className={`result-card ${prize.isWin ? 'result-card--win' : 'result-card--again'}`}>
        <div className="result-icon">{prize.icon}</div>
        <h2 className="result-title">{prize.isWin ? prize.label : '¡Sigue participando!'}</h2>
        <p className="result-desc">{prize.description}</p>
        <button type="button" className="result-done" onClick={onDone}>
          Listo
        </button>
        <p className="result-timer">Esta pantalla se reinicia en {secondsLeft}s…</p>
        <ReviewQR />
      </div>
    </div>
  )
}
