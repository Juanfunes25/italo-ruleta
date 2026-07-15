import { QRCodeSVG } from 'qrcode.react'
import { GOOGLE_REVIEW_URL, INSTAGRAM_URL } from '../config/prizes.js'
import './ReviewQR.css'

// Tarjeta pasiva y no bloqueante: aparece unos segundos después del premio,
// el cliente puede ignorarla y la pantalla se resetea igual.
export default function ReviewQR() {
  return (
    <div className="review-qr">
      <div className="review-qr__item">
        <QRCodeSVG value={GOOGLE_REVIEW_URL} size={72} bgColor="transparent" fgColor="var(--navy)" level="M" />
        <span>¿Te gustó tu Ítalo?<br />Déjanos tu reseña</span>
      </div>
      {INSTAGRAM_URL && (
        <div className="review-qr__item">
          <QRCodeSVG value={INSTAGRAM_URL} size={72} bgColor="transparent" fgColor="var(--navy)" level="M" />
          <span>Síguenos en<br />Instagram</span>
        </div>
      )}
    </div>
  )
}
