# Ítalo Ruleta de Premios 🎡

Kiosco táctil (PWA) para tablet en el mostrador de cada sucursal de **Ítalo Gelateria**.
El cliente toca la rueda, gira y gana un premio (o "sigue participando") mientras espera
o paga. Sin login, sin datos personales, sin backend.

## Cómo correrlo

```bash
npm install
npm run dev      # desarrollo en http://localhost:3300
npm run build    # versión de producción (carpeta dist/)
npm run preview  # previsualizar el build
```

Para probarlo en la tablet desde la misma red WiFi: corre `npm run dev` y abre
`http://IP-DE-TU-PC:3300` en la tablet.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub llamado **exactamente** `italo-ruleta` y súbele este
   proyecto (`git init`, `git remote add origin ...`, `git push`).
2. En GitHub → **Settings → Pages → Build and deployment → Source**, selecciona
   **GitHub Actions**.
3. Cada vez que subas cambios a `main`, el workflow `.github/workflows/deploy.yml`
   compila y publica automáticamente en:
   `https://TU-USUARIO.github.io/italo-ruleta/`
4. También puedes publicar a mano desde la pestaña **Actions** del repo
   ("Run workflow").

Si alguna vez cambias el nombre del repositorio, actualiza la constante `REPO` en
[`vite.config.js`](vite.config.js).

## Modo kiosco en la tablet (pantalla completa)

**Android (Chrome):**
1. Abre la URL publicada en Chrome.
2. Menú (⋮) → **"Agregar a pantalla de inicio"**.
3. Abre el ícono creado desde la pantalla de inicio (se abre en modo `standalone`,
   sin barra de navegador).
4. Para bloquearla en esa sola app: Ajustes → Aplicaciones → Chrome (o el ícono
   instalado) → activar **"Anclaje de pantalla" (Screen Pinning)**, o usar el modo
   "Kiosco" del fabricante de la tablet si está disponible.

**iOS/iPadOS (Safari):**
1. Abre la URL publicada en Safari.
2. Botón compartir → **"Agregar a inicio"**.
3. Abre el ícono creado desde la pantalla de inicio (pantalla completa, sin Safari UI).
4. Para bloquearla: Ajustes → Accesibilidad → **Acceso Guiado (Guided Access)** →
   actívalo, luego triple-clic en el botón lateral/inicio dentro de la app para
   activar el modo guiado.

En ambos casos, deja la tablet en **orientación horizontal (landscape)** — la app
está diseñada para 16:9 apaisado.

## Editar premios, textos y probabilidades

Todo vive en un único archivo: [`src/config/prizes.js`](src/config/prizes.js).

- **`weight`** = probabilidad real de ganar ese premio (sorteo ponderado sobre el
  total de pesos). No tiene que coincidir con el tamaño visual de la rebanada.
- **`angle`** = qué tan grande se dibuja la rebanada en la rueda (solo visual, para
  que los premios raros sigan siendo legibles). La suma de todos los `angle` debe
  dar 360.
- **`GOOGLE_REVIEW_URL`** y **`INSTAGRAM_URL`**: reemplaza estos placeholders con
  tus links reales (se muestran junto con el premio al revelarlo).
- **`AUTO_RESET_SECONDS`**, **`SPIN_DURATION_SECONDS`**, **`BRANCHES_SCREEN_SECONDS`**:
  tiempos de la animación, la pantalla de sucursales y el reseteo automático.
- **`STAFF_PIN`**: el código de 3 caracteres que el staff debe ingresar antes de
  cada giro (ver siguiente sección).

No hace falta tocar ningún otro archivo para estos cambios.

## Código de staff antes de girar

Para que un mismo cliente no pueda girar varias veces seguidas sin autorización,
cada giro pide un código corto (por defecto `abc`, editable en `STAFF_PIN` dentro
de [`src/config/prizes.js`](src/config/prizes.js)). El cliente toca la rueda, y en
vez de girar aparece un cuadro pidiendo el código — lo ingresa el cajero después de
cobrar la compra mínima. Se pide de nuevo en cada giro, nunca queda "desbloqueado".

## Panel de staff (oculto)

Toca el wordmark **"Ítalo"** (columna izquierda) **5 veces seguidas** para abrir un
panel con: giros del día, cuántos de cada premio han salido, botón para reiniciar
el contador y botón **"Exportar CSV"**. Invisible para un cliente casual, sin PIN
(la única protección es el gesto secreto), datos guardados solo en `localStorage`
de esa tablet — no hay backend ni sincronización entre sucursales.

## Estructura

```
src/
├─ config/prizes.js     Único archivo a editar: premios, pesos, ángulos, links, tiempos
├─ components/
│  ├─ Wheel.jsx          Rueda SVG + anillo tipo barquillo + animación de giro
│  ├─ PinGate.jsx        Código de staff que se pide antes de cada giro
│  ├─ BranchesScreen.jsx Pantalla con las 5 sucursales antes de revelar el premio
│  ├─ ResultCard.jsx     Tarjeta de premio + confeti + cuenta regresiva
│  ├─ ReviewQR.jsx        QR de reseña/Instagram, junto con el premio
│  └─ StaffPanel.jsx     Panel oculto de estadísticas
├─ hooks/useStats.js     Contador local en localStorage (por día)
├─ utils/prizeSelection.js  Sorteo ponderado + geometría de la rueda (sin React, testeable)
└─ styles/theme.css      Paleta y tipografía de marca (Poppins, autoalojada)
```

## Íconos de la PWA

Se generan desde `scripts/icon-source.svg`:

```bash
node scripts/gen-icons.js
```

## Marca

Colores y tipografía siguen el `BrandBook Italo.pdf`:
negro `#000000` (predomina), verde `#C5D288` (decora), blanco (rellena) — más algunos
tonos de apoyo tomados del local real (ladrillo, café, verde profundo) para que la
rueda tenga suficiente variedad de colores. Tipografía: **Poppins** en todo (títulos
y cuerpo). Todo vive en `src/styles/theme.css`.

## Notas técnicas

- **100% estático**, sin backend ni base de datos — listo para GitHub Pages.
- **PWA offline**: `vite-plugin-pwa` cachea toda la app (incluidas las tipografías,
  autoalojadas con `@fontsource`) para que siga funcionando si la tablet pierde el
  WiFi un momento.
- Las probabilidades reales se verifican en `src/utils/prizeSelection.js`
  (`pickWeightedPrize`), totalmente independiente del ángulo visual de cada
  rebanada — puedes editar `weight` y `angle` por separado en `prizes.js`.
