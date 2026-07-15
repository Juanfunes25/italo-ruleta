// Historial de premios GANADOS a lo largo del tiempo (no solo el día de hoy,
// a diferencia de useStats). Vive en localStorage, sin backend.
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'italo-ruleta-win-history-v1'
// Tope razonable para que localStorage no crezca sin límite en un kiosco que
// queda prendido meses — no hace falta más para "un pequeño control".
const MAX_ENTRIES = 1000

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useWinHistory() {
  const [entries, setEntries] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const recordWin = useCallback((prize) => {
    setEntries((prev) => {
      const next = [...prev, { id: prize.id, label: prize.label, icon: prize.icon, timestamp: Date.now() }]
      return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next
    })
  }, [])

  const resetHistory = useCallback(() => setEntries([]), [])

  return { entries, recordWin, resetHistory }
}
