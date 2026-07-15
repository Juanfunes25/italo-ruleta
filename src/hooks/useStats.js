// Contador local de estadísticas para el staff. Vive solo en localStorage,
// invisible para el cliente, sin backend.
import { useCallback, useEffect, useState } from 'react'
import { PRIZES } from '../config/prizes.js'

const STORAGE_KEY = 'italo-ruleta-stats-v1'

function todayKey() {
  // Fecha local en formato YYYY-MM-DD, para poder detectar el cambio de día.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function emptyCounts() {
  return Object.fromEntries(PRIZES.map((p) => [p.id, 0]))
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function loadForToday() {
  const raw = loadRaw()
  if (!raw || raw.date !== todayKey()) {
    return { date: todayKey(), counts: emptyCounts() }
  }
  // Completa premios nuevos que se hayan agregado a la config después de guardar.
  return { date: raw.date, counts: { ...emptyCounts(), ...raw.counts } }
}

export function useStats() {
  const [data, setData] = useState(loadForToday)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Si la app queda abierta pasada la medianoche, reinicia el día automáticamente.
  useEffect(() => {
    const interval = setInterval(() => {
      const key = todayKey()
      setData((prev) => (prev.date === key ? prev : { date: key, counts: emptyCounts() }))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const recordSpin = useCallback((prizeId) => {
    setData((prev) => {
      const key = todayKey()
      const base = prev.date === key ? prev.counts : emptyCounts()
      return { date: key, counts: { ...base, [prizeId]: (base[prizeId] ?? 0) + 1 } }
    })
  }, [])

  const resetToday = useCallback(() => {
    setData({ date: todayKey(), counts: emptyCounts() })
  }, [])

  const totalSpins = Object.values(data.counts).reduce((a, b) => a + b, 0)

  return { counts: data.counts, totalSpins, recordSpin, resetToday }
}
