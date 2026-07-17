import { Component } from 'react'
import './ErrorBoundary.css'

// Red de seguridad para un kiosco sin supervisión: si algo falla al renderizar
// (o la tablet quedó con una versión vieja en caché tras una actualización),
// en vez de pantalla en blanco se muestra un botón para que el staff lo
// resuelva solo, sin tener que llamar a nadie.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleHardReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
    } catch {
      // si algo de esto falla, igual intentamos recargar
    }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-boundary">
        <div className="error-boundary__card">
          <p className="error-boundary__icon">🍦</p>
          <h2>Algo no cargó bien</h2>
          <p>Toca el botón para reiniciar la pantalla.</p>
          <button type="button" className="error-boundary__btn" onClick={this.handleHardReset}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }
}
