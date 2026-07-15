import { BRANCHES } from '../config/branches.js'
import './Branches.css'

// Se muestra dentro de la tarjeta de resultado, antes del premio: le recuerda
// al cliente en cuál de las 5 sucursales puede canjearlo.
export default function Branches() {
  return (
    <div className="branches">
      <p className="branches__title">Válido en nuestras 5 sucursales</p>
      <ul className="branches__list">
        {BRANCHES.map((b) => (
          <li key={b.id} className="branches__item">
            <span className="branches__pin" aria-hidden="true">
              📍
            </span>
            <span className="branches__text">
              <span className="branches__name">{b.name}</span>
              <span className="branches__address">{b.address}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
