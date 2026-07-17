import { QRCodeSVG } from 'qrcode.react'
import { INSTAGRAM_URL } from '../config/prizes.js'
import './ReviewQR.css'

// Tarjeta pasiva y no bloqueante: se muestra junto con el premio, el cliente
// puede ignorarla y la pantalla se resetea igual.
export default function ReviewQR() {
  if (!INSTAGRAM_URL) return null

  return (
    <div className="review-qr">
      <div className="review-qr__item">
        <QRCodeSVG value={INSTAGRAM_URL} size={72} bgColor="transparent" fgColor="var(--charcoal)" level="M" />
        <span>Síguenos en<br />Instagram</span>
      </div>
    </div>
  )
}
