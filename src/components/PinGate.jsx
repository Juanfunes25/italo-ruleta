import { useEffect, useRef, useState } from 'react'
import { STAFF_PIN } from '../config/prizes.js'
import './PinGate.css'

// Se pide antes de CADA giro (no solo el primero) para que un mismo cliente
// no pueda girar varias veces seguidas sin que el staff lo autorice.
export default function PinGate({ onSuccess, onCancel }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (value.trim().toLowerCase() === STAFF_PIN.toLowerCase()) {
      onSuccess()
      return
    }
    setError(true)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="pin-overlay">
      <form className="pin-card" onSubmit={handleSubmit}>
        <p className="pin-card__eyebrow">Solo staff</p>
        <h2 className="pin-card__title">Código para girar</h2>
        <input
          ref={inputRef}
          type="password"
          inputMode="text"
          maxLength={3}
          autoComplete="off"
          autoCapitalize="off"
          className={`pin-card__input ${error ? 'pin-card__input--error' : ''}`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError(false)
          }}
          aria-label="Código de staff"
        />
        {error && <p className="pin-card__error">Código incorrecto, intenta de nuevo.</p>}
        <div className="pin-card__actions">
          <button type="button" className="pin-card__btn pin-card__btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="pin-card__btn pin-card__btn--primary">
            Confirmar
          </button>
        </div>
      </form>
    </div>
  )
}
