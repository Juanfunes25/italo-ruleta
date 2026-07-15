import { useMemo, useState } from 'react'
import { PRIZES } from '../config/prizes.js'
import './HistoryPanel.css'

const WIN_PRIZES = PRIZES.filter((p) => p.isWin)

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('es-HN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildCsv(entries) {
  const rows = [['Fecha', 'Premio'], ...entries.map((e) => [formatDate(e.timestamp), e.label])]
  return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
}

export default function HistoryPanel({ entries, onReset, onClose }) {
  const [confirmingReset, setConfirmingReset] = useState(false)

  const counts = useMemo(() => {
    const map = Object.fromEntries(WIN_PRIZES.map((p) => [p.id, 0]))
    for (const entry of entries) {
      if (map[entry.id] !== undefined) map[entry.id] += 1
    }
    return map
  }, [entries])

  const recent = useMemo(() => [...entries].reverse().slice(0, 30), [entries])

  const handleExport = () => {
    const csv = buildCsv(entries)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'italo-ruleta-historial-premios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(event) => event.stopPropagation()}>
        <div className="history-panel__header">
          <h2>Premios ganados</h2>
          <button type="button" className="history-close" onClick={onClose} aria-label="Cerrar historial">
            ✕
          </button>
        </div>

        <p className="history-total">
          Total ganados: <strong>{entries.length}</strong>
        </p>

        <ul className="history-list">
          {WIN_PRIZES.map((p) => (
            <li key={p.id}>
              <span className="history-list__icon">{p.icon}</span>
              <span className="history-list__label">{p.label}</span>
              <span className="history-list__count">{counts[p.id] ?? 0}</span>
            </li>
          ))}
        </ul>

        {recent.length > 0 && (
          <>
            <p className="history-recent__title">Últimos giros ganadores</p>
            <ul className="history-recent">
              {recent.map((entry, i) => (
                <li key={`${entry.timestamp}-${i}`}>
                  <span>{entry.icon} {entry.label}</span>
                  <span className="history-recent__date">{formatDate(entry.timestamp)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="history-actions">
          <button type="button" className="history-btn history-btn--secondary" onClick={handleExport}>
            Exportar CSV
          </button>
          {confirmingReset ? (
            <div className="history-confirm">
              <span>¿Borrar todo el historial?</span>
              <button
                type="button"
                className="history-btn history-btn--danger"
                onClick={() => {
                  onReset()
                  setConfirmingReset(false)
                }}
              >
                Sí, borrar
              </button>
              <button type="button" className="history-btn history-btn--secondary" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" className="history-btn history-btn--danger" onClick={() => setConfirmingReset(true)}>
              Borrar historial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
