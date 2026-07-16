import { useRef, useState } from 'react'
import { STAFF_PIN } from '../config/prizes.js'
import './PinGate.css'

// Campo chico y siempre visible bajo el aviso de compra mínima. Se pide antes
// de CADA giro (no solo el primero) para que un mismo cliente no pueda girar
// varias veces seguidas sin que el staff ingrese el código. Se valida solo
// (sin botón) apenas se completan los 3 caracteres.
export default function PinGate({ onSuccess }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (event) => {
    const next = event.target.value.replace(/\D/g, '') // solo dígitos
    setValue(next)
    if (next.length < STAFF_PIN.length) return

    if (next === STAFF_PIN) {
      setValue('')
      onSuccess()
      return
    }
    setShake(true)
    setValue('')
    setTimeout(() => setShake(false), 350)
  }

  return (
    <div className="pin-inline">
      <label className="pin-inline__label" htmlFor="staff-pin-input">
        PIN staff
      </label>
      <input
        id="staff-pin-input"
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={STAFF_PIN.length}
        autoComplete="off"
        className={`pin-inline__input ${shake ? 'pin-inline__input--shake' : ''}`}
        value={value}
        onChange={handleChange}
        aria-label="PIN de staff para autorizar el giro"
      />
    </div>
  )
}
