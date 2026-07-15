import { BRANCH_NAMES } from '../config/branches.js'
import './BranchesScreen.css'

// Pantalla de transición: se muestra unos segundos justo después de que la
// rueda se detiene y antes de revelar el premio (ver BRANCHES_SCREEN_SECONDS
// en prizes.js). No requiere ninguna acción del cliente, avanza sola.
export default function BranchesScreen() {
  return (
    <div className="branches-overlay">
      <div className="branches-card">
        <p className="branches-card__eyebrow">Ítalo Gelateria</p>
        <h2 className="branches-card__title">Nos encuentras en 5 sucursales</h2>
        <ul className="branches-card__list">
          {BRANCH_NAMES.map((name) => (
            <li key={name} className="branches-card__item">
              <span className="branches-card__pin" aria-hidden="true">
                📍
              </span>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
