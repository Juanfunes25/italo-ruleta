import { useState } from 'react'
import { PRIZES } from '../config/prizes.js'
import './StaffPanel.css'

function buildCsv(counts, totalSpins) {
  const rows = [['Premio', 'Cantidad'], ...PRIZES.map((p) => [p.label, String(counts[p.id] ?? 0)]), ['Total giros', String(totalSpins)]]
  return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
}

export default function StaffPanel({ counts, totalSpins, onReset, onClose }) {
  const [confirmingReset, setConfirmingReset] = useState(false)

  const handleExport = () => {
    const csv = buildCsv(counts, totalSpins)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `italo-ruleta-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="staff-overlay" onClick={onClose}>
      <div className="staff-panel" onClick={(e) => e.stopPropagation()}>
        <div className="staff-panel__header">
          <h2>Panel de staff</h2>
          <button type="button" className="staff-close" onClick={onClose} aria-label="Cerrar panel">
            ✕
          </button>
        </div>

        <p className="staff-total">
          Giros de hoy: <strong>{totalSpins}</strong>
        </p>

        <ul className="staff-list">
          {PRIZES.map((p) => (
            <li key={p.id}>
              <span className="staff-list__icon">{p.icon}</span>
              <span className="staff-list__label">{p.label}</span>
              <span className="staff-list__count">{counts[p.id] ?? 0}</span>
            </li>
          ))}
        </ul>

        <div className="staff-actions">
          <button type="button" className="staff-btn staff-btn--secondary" onClick={handleExport}>
            Exportar CSV
          </button>
          {confirmingReset ? (
            <div className="staff-confirm">
              <span>¿Reiniciar contador de hoy?</span>
              <button
                type="button"
                className="staff-btn staff-btn--danger"
                onClick={() => {
                  onReset()
                  setConfirmingReset(false)
                }}
              >
                Sí, reiniciar
              </button>
              <button type="button" className="staff-btn staff-btn--secondary" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" className="staff-btn staff-btn--danger" onClick={() => setConfirmingReset(true)}>
              Reiniciar contador del día
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
