# Research: Apariencia accesible (modo oscuro y texto ampliable)

**Date**: 2026-11-20

## Decisions

### 1. Tema con atributos en `<html>` y variables CSS

- **Decisión**: Mantener `data-theme` en `<html>` con tres valores (`system`, `light`, `dark`) y expresar todos los colores como tokens CSS semánticos (`--color-cream`, `--color-ink`, `--color-red`, `--color-line`, `--color-focus`, etc.). El bloque oscuro se aplica tanto a `:root[data-theme="dark"]` como a `:root[data-theme="system"]` dentro de `@media (prefers-color-scheme: dark)`.
- **Rationale**: Es la extensión natural de `styles/site.css`, que ya usa custom properties. Permite que el navegador resuelva la preferencia del sistema **antes de pintar** y también cuando cambia en caliente, sin listener ni recarga. Una elección manual `light` sigue siendo clara aunque el sistema esté en oscuro porque la media query solo afecta a `system`.
- **Alternativas consideradas**:
  - Clases en `<body>` (`theme-dark`): obligaría a esperar a que se parseara el body y dejaría la cabecera sin tema durante el primer fotograma.
  - `light-dark()` de CSS: más compacto, pero hace depender el resultado de `color-scheme` y de soporte más reciente; con tres estados (`system`/manual claro/manual oscuro) los tokens explícitos son más predecibles y fáciles de auditar.
  - Librería de temas: añadiría dependencia y build, prohibidos por la constitución.

### 2. Arranque síncrono anti-parpadeo

- **Decisión**: Un `<script>` clásico (no `module`) en el `<head>`, colocado antes de `<link rel="stylesheet">`, lee `fratelli.appearance.theme` y `fratelli.appearance.textSize`, sanea los valores contra listas permitidas y escribe `document.documentElement.dataset.theme` y `.dataset.textSize`. Si no hay clave, deja los valores por defecto del markup (`system`, `normal`).
- **Rationale**: Los módulos ESM son diferidos y se ejecutan después del parseo, demasiado tarde para evitar el flash. Un script inline de unas pocas líneas, sin fetch ni imports, fija el estado antes de que CSS pinte. MDN recomienda declarar el esquema de color pronto y usar `<meta name="color-scheme">` para reducir destellos del navegador.
- **Alternativas consideradas**:
  - Leer `localStorage` desde `app.js`: rechazado por parpadeo.
  - Cookie de tema: se enviaría al servidor y no aporta nada en un sitio estático.
  - Parámetro de URL: no sobrevive a una visita normal sin bookmark y ensucia la navegación.

### 3. Escala de texto sin escalar el layout

- **Decisión**: `--font-scale` toma `1`, `1.15` o `1.30` según `data-text-size`. Se introduce un conjunto de tokens tipográficos (`--fs-body`, `--fs-small`, `--fs-h3`, `--fs-h2`, `--fs-h1`, `--fs-button`, `--fs-nav`, `--fs-price`) y cada `font-size` existente pasa a `calc(var(--fs-*) * var(--font-scale))`. Los tokens de espaciado, radios, sombras y `--header-height` permanecen sin escalar. Los botones y zonas pulsables usan `min-height: max(2.75rem, 44px)`.
- **Rationale**: Cumple los niveles concretos acordados (+15 %/+30 %) de forma medible y evita el efecto secundario de subir `html { font-size }`, que agrandaría también paddings y la cabecera, incumpliendo la clarificación de "cabecera sin crecer".
- **Alternativas consideradas**:
  - `html { font-size: 115% }`: escala todos los `rem`, incluida la altura de cabecera y los márgenes; descartado.
  - Dejar que el usuario use solo el zoom del navegador: no cumple el requisito de un control propio en la web.
  - `transform: scale()`: deforma bordes y zonas táctiles, y no cambia el flujo; descartado.

### 4. Persistencia local y tolerancia a fallos

- **Decisión**: Dos claves independientes en `localStorage`: `fratelli.appearance.theme` (`system` | `light` | `dark`) y `fratelli.appearance.textSize` (`normal` | `large` | `xlarge`). Toda lectura y escritura se envuelve en `try/catch`. Si falla, se mantiene un estado en memoria para la visita actual y no se muestra ningún mensaje de error.
- **Rationale**: "Seguir el sistema" es una decisión explícita que debe recordarse, por eso se guarda `system` en lugar de borrar la clave. Separar claves evita que cambiar el tamaño altere el tema (FR-009). `localStorage` puede lanzar `SecurityError` en modos restringidos; MDN documenta ese riesgo y la necesidad de manejarlo.
- **Alternativas consideradas**: `sessionStorage` (no sobrevive a la visita), una única clave JSON (acopla las dos preferencias), IndexedDB (desproporcionado para dos cadenas), cuenta o servicio remoto (prohibido y recogería datos personales).

### 5. Reacción al cambio del sistema con la página abierta

- **Decisión**: El aspecto lo cambia CSS mediante la media query, por lo que es inmediato. El único código JS que escucha `matchMedia('(prefers-color-scheme: dark)')` actualiza la meta `theme-color` cuando el tema efectivo es `system`. Si hay elección manual, el listener no modifica el aspecto ni la meta.
- **Rationale**: `matchMedia()` expone `matches` y el evento `change` (MDN); usarlo solo para la meta evita duplicar la resolución del tema y reduce código. El requisito SC-007 de < 1 s se cumple por construcción.
- **Alternativas consideradas**: recargar la página al detectar el cambio (rompe la cesta y es molesto), o no reaccionar (incumple FR-004).

### 6. Controles y accesibilidad

- **Decisión**: Dos `<select>` nativos en la cabecera. Cada opción incluye la palabra en la propia etiqueta visible (`Seguir el sistema`, `Claro`, `Oscuro`; `Normal`, `Grande`, `Muy grande`), y el `<label>` accesible se asocia con `for`. El valor seleccionado se ve cerrado el control. El foco `:focus-visible` usa `--color-focus` con contraste ≥ 3:1 en ambos temas. En pantallas ≤30 rem se compactan paddings y se acorta solo la etiqueta visible de navegación "Tu pedido" → "Pedido" (con `aria-label` intacto) para no crecer la cabecera.
- **Rationale**: Los select nativos ya ofrecen teclado, estado seleccionado, anuncio por tecnología de asistencia y un área táctil cómoda sin JS adicional. Las palabras evitan iconos crípticos para personas poco habituadas a la tecnología.
- **Alternativas consideradas**: botones radio personalizados (más HTML/CSS y riesgo de foco poco visible), un único botón flotante con popover (los controles no quedan vistos permanentemente), iconos solos (incumple "etiquetas escritas").

### 7. Pruebas sin dependencias nuevas

- **Decisión**: Añadir un módulo puro `scripts/appearance.js` para Jest y un spec de Playwright con `page.emulateMedia({ colorScheme })`, `addInitScript` para sembrar/bloquear `localStorage` y un helper `tests/helpers/contrast.js` que calcula contraste WCAG y resuelve el primer fondo no transparente.
- **Rationale**: Cubre las 9 combinaciones, el no-parpadeo, el cambio en caliente, el 360 px, el teclado y la cesta intacta sin jsdom ni librerías de accesibilidad. Jest ya está configurado para ESM nativo y Playwright ya arranca `serve`.
- **Alternativas consideradas**: axe-core o paquetes de contraste (nueva dependencia no autorizada); snapshots visuales (no comprueban contraste ni comportamiento del sistema).

## Paleta y verificación de contraste

Paleta propuesta. Los bordes decorativos (`--color-line`) pueden ser sutiles; se añade `--color-control-border` exclusivamente para selects, inputs y botones, con ≥ 3:1.

| Token | Claro | Oscuro |
|---|---|---|
| `--color-cream` (fondo página) | `#fbf6ee` | `#17120f` |
| `--color-paper` (superficies) | `#ffffff` | `#241c18` |
| `--color-ink` (texto principal) | `#1f1a17` | `#f7eee6` |
| `--color-muted` (texto secundario) | `#5b524c` | `#cdbdb1` |
| `--color-red` (enlaces/acentos) | `#a3120f` | `#ff9a8f` |
| `--color-red-dark` (hover/énfasis) | `#7a0d0b` | `#ffb3aa` |
| `--color-red-soft` (fondo aviso error) | `#fbe9e7` | `#3a1b18` |
| `--color-green` (texto éxito) | `#2f6b3a` | `#8fe0a3` |
| `--color-success-bg` (fondo éxito) | `#e5f2e7` | `#16321f` |
| `--color-line` (borde decorativo) | `#e6dccf` | `#7d675b` |
| `--color-control-border` | `#6b5b50` | `#7d675b` |
| `--color-focus` | `#1a5fb4` | `#ffd166` |
| `--color-header` | `#a3120f` | `#4a0f0c` |
| `--color-bar-bg` / texto | `#1f1a17` / `#fff` | `#f7eee6` / `#1f1a17` |
| Gradiente hero | `#8f100d → #c4291f` + blanco | `#3b0f0d → #8f201a` + blanco |

Ratios calculados con la fórmula WCAG 2.x de luminancia relativa sRGB (los del gradiente son los extremos comprobados con texto blanco):

| Pareja | Claro | Oscuro | Umbral |
|---|---:|---:|---:|
| Texto principal / fondo página | 16.02:1 | 16.22:1 | 4.5 |
| Texto secundario / fondo página | 7.08:1 | 10.19:1 | 4.5 |
| Texto principal / superficie | 17.24:1 | 14.61:1 | 4.5 |
| Enlace / fondo | 7.36:1 | 9.09:1 | 4.5 |
| Enlace hover / fondo | 10.33:1 | 10.87:1 | 4.5 |
| Texto blanco / cabecera | 7.92:1 | 15.39:1 | 4.5 |
| Texto blanco / botón primario | 7.92:1 | 7.92:1 | 4.5 |
| Texto blanco / extremos del hero | ≥ 5.70:1 | ≥ 8.79:1 | 4.5 |
| Aviso éxito (texto/fondo) | 8.83:1 | 8.85:1 | 4.5 |
| Aviso error (texto/fondo) | 10.33:1 | 7.61:1 | 4.5 |
| Total de la cesta / superficie | 11.11:1 | 8.19:1 | 4.5 |
| Borde de control / su superficie | 6.49:1 | 3.16:1 | 3.0 |
| Foco / fondo y superficie | ≥ 5.84:1 | ≥ 11.61:1 | 3.0 |
| Barra móvil (texto/fondo) | 17.24:1 | 15.04:1 | 4.5 |

Notas:

- En claro se mantiene `--color-red` para botones/cabecera; en oscuro el acento se aclara para que los enlaces sobre fondo oscuro sigan legibles. El hover oscuro usa una versión aún más clara (`#ffb3aa`), no más oscura.
- La barra móvil invierte sus colores en oscuro para no perder contraste sobre el fondo oscuro.
- El test e2e comprueba estos pares y además recorre los elementos visibles reales; los elementos con gradiente se validan contra los extremos declarados aquí.

## Sources

- [MDN: `color-scheme` CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme) — recomienda declarar el esquema pronto y usar `<meta name="color-scheme">` para evitar destellos; `prefers-color-scheme` para el resto de elementos.
- [MDN: `@media prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme)
- [MDN: `Window.matchMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) — `matches` y evento `change`.
- [MDN: `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — acceso por origen y posibles excepciones de seguridad.
- [W3C: WCAG 2.2 — Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) — umbrales 4.5:1 / 3:1.
- [Constitución del proyecto](../../.specify/memory/constitution.md) y [plan de la feature 001](../001-pizzeria-web/plan.md) — stack, tooling y convenciones reutilizadas.
