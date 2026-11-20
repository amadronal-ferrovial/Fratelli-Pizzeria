# Implementation Plan: Apariencia accesible (modo oscuro y texto ampliable)

**Branch**: `issue/apariencia-accesible` (feature: `002-apariencia-accesible`, creada desde `origin/dev`) | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Especificación de la feature 002: tema claro/oscuro que sigue al sistema por defecto, cambio manual, tamaño de texto en tres niveles, recuerdo local, contraste AA y sin parpadeo al cargar.

## Summary

Añadir a la web estática existente una capa de apariencia sin framework, build ni dependencias nuevas. El tema se resuelve con atributos en `<html>` y variables CSS: por defecto `data-theme="system"` delega en `prefers-color-scheme` (incluso en caliente), y las elecciones manuales escriben `light` o `dark`. Un script síncrono y mínimo en el `<head>` lee dos claves de `localStorage` y fija los atributos antes de que se pinte nada, evitando el parpadeo de tema y de tamaño. El tamaño de texto usa un único multiplicador (`--font-scale`) aplicado a tokens tipográficos, sin escalar el layout ni aumentar la altura de la cabecera. La lógica pura de normalización/persistencia vive en un módulo ESM DOM-free (`scripts/appearance.js`) y se prueba con Jest; los flujos reales (cambio en caliente del sistema, persistencia, teclado, 360 px, contraste y cesta intacta) se prueban con Playwright. No se modifica la carta, la cesta ni el flujo de demostración.

## Technical Context

**Language/Version**: HTML5, CSS3 y JavaScript ES modules (sin transpilación); Node.js 26.13.0 LTS solo para tooling, igual que la feature 001.

**Primary Dependencies**: Sin dependencias nuevas. Se reutilizan `serve@14.2.6` (preview local), `jest@30.5.2` (unit) y `@playwright/test@1.65.0` con Chromium (e2e), ya fijados en `package.json`/`package-lock.json`.

**Storage**: `localStorage` del mismo origen, con dos claves independientes y prefijadas (`fratelli.appearance.theme`, `fratelli.appearance.textSize`). Acceso envuelto en `try/catch`: si el navegador lo bloquea, la preferencia vive solo en memoria durante la visita. No se usan cookies, sesión, cuenta ni servicio externo.

**Testing**: Jest 30.5.2 en modo ESM nativo (`--experimental-vm-modules`, `transform: {}`) para lógica pura; Playwright 1.65.0 con Chromium para comportamiento en navegador. Se añaden `tests/unit/appearance.test.js` y `tests/e2e/appearance.spec.js` sin cambiar las configuraciones existentes.

**Target Platform**: Navegadores de escritorio y móvil que soporten CSS custom properties, `prefers-color-scheme`, ES modules y `localStorage` (todos ellos Baseline). Preview local en `127.0.0.1:3000`; salida estática y agnóstica del proveedor de hosting.

**Project Type**: Un único frontend estático de una página; sigue sin haber API, backend ni pantalla de gestión.

**Performance Goals**: Sin petición adicional y sin coste perceptible: el script de arranque solo lee dos claves locales y escribe dos atributos. El objetivo de contenido usable en < 3 s de la feature 001 se mantiene. El cambio de tema por preferencia del sistema debe reflejarse en < 1 s (se resuelve por CSS, sin recarga).

**Constraints**: No framework, bundler, librería de UI, backend, API externa ni datos personales. No se tocan `data/menu.json`, `scripts/cart.js` ni el total de la cesta. La cabecera no puede crecer de altura al ampliar el texto. No debe aparecer tema ni tamaño equivocados en el primer fotograma. Las opciones se nombran con palabras cotidianas.

**Scale/Scope**: Una página, 3 opciones de tema × 3 tamaños = 9 combinaciones verificables; dos claves de almacenamiento; un conjunto de tokens de color por tema.

## Constitution Check

*GATE: debe pasar antes de Phase 0 y recheck tras Phase 1.*

| Principio | Alineación del plan | Gate |
|---|---|---|
| I. Lightweight, no-build stack | HTML/CSS/ES modules existentes; el único script nuevo es un módulo pequeño y un inline de ~10 líneas. `serve` sigue siendo solo tooling local. | PASS |
| II. Simplicity (YAGNI) | No se añaden dependencias, capas ni abstracciones especulativas: dos claves, dos atributos, un multiplicador tipográfico y un módulo puro. | PASS |
| III. Test-first (NON-NEGOTIABLE) | Los tests unitarios y e2e de apariencia se escriben y ven fallar antes de tocar `index.html`, `site.css`, `app.js` ni `appearance.js`. | PASS |
| IV. Content in local JSON | `data/menu.json` no se modifica; esta feature solo cambia presentación, no contenido de carta. | PASS |
| V. Operator-friendly & Accessible | Controles con etiquetas escritas en la cabecera, teclado y foco visible, contraste AA medido en ambos temas, 44 px de zona pulsable y sin desbordes a 360 px. | PASS |
| Stack & constraints | No hay nueva librería, CSS framework ni versión que confirmar con el owner. Se mantienen Node 26.13.0, npm, versiones fijadas y lockfile commitido. | PASS |
| Workflow y Commits | Rama `issue/apariencia-accesible` desde `origin/dev`; PR a `dev` con `Closes #N` tras `npm test`; Conventional Commits. Agentes/estado local (` .specify/feature.json`) siguen ignorados. | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/002-apariencia-accesible/
├── plan.md                    # Este archivo
├── research.md                # Decisiones técnicas y paleta verificada
├── data-model.md              # Entidades de preferencia y transiciones
├── quickstart.md              # Comandos y comprobaciones de aceptación
├── contracts/
│   └── appearance.md          # Contrato de UI y de atributos internos
├── checklists/
│   └── requirements.md        # Checklist de calidad (ya completado)
└── tasks.md                   # Lo creará /speckit-tasks, no este comando
```

### Source Code (repository root)

```text
index.html                     # + meta de color, atributos iniciales, script boot y controles
styles/site.css                # + tokens por tema, escala tipográfica y reglas compactas
scripts/
├── app.js                     # + cableado de los dos controles y del listener del sistema
├── appearance.js              # NUEVO: normalización, persistencia y resolución pura
└── cart.js                    # sin cambios
data/menu.json                 # sin cambios
tests/
├── unit/
│   ├── cart.test.js           # sin cambios
│   ├── menu-data.test.js      # sin cambios
│   └── appearance.test.js     # NUEVO
├── e2e/
│   ├── menu.spec.js           # sin cambios
│   └── appearance.spec.js     # NUEVO
└── helpers/
    └── contrast.js            # NUEVO: cálculo WCAG y resolución de fondos para e2e
jest.config.mjs                # sin cambios
playwright.config.mjs          # sin cambios
package.json / package-lock.json # sin cambios
```

**Structure Decision**: Se mantiene un único frontend en la raíz, como en la feature 001. `appearance.js` es DOM-free para poder probarlo con Jest; `app.js` sigue siendo el único punto de cableado de UI; el script inline de `index.html` existe solo para aplicar el estado antes del primer pintado. No se crea un directorio de configuración nuevo ni se altera la estructura de datos de la carta.

## Design Decisions (resumen ejecutivo)

1. **Estado en el DOM**: `<html data-theme="system|light|dark" data-text-size="normal|large|xlarge">`. El CSS define los tokens claros por defecto y un bloque oscuro reutilizado por `[data-theme="dark"]` y por `@media (prefers-color-scheme: dark) { :root[data-theme="system"] { … } }`. Así el cambio del sistema en caliente lo aplica el navegador sin JS.
2. **Anti-parpadeo**: script clásico y síncrono en el `<head>`, antes de `<link rel="stylesheet">`, que sanea las dos claves y escribe los atributos. No hace fetch ni importa módulos (los módulos son diferidos y llegarían tarde).
3. **Persistencia**: dos claves separadas con `try/catch`. Escribir `system` o `normal` también es una decisión explícita y se recuerda. Si falla el almacenamiento, no se muestra error: el módulo mantiene el estado en memoria.
4. **Texto**: `--font-scale` = 1 / 1.15 / 1.30. Se aplica solo a tokens de `font-size` (cuerpo, encabezados, botones, nav, precios, avisos). Los tokens de espaciado y `--header-height` no se escalan; los botones usan `min-height: max(2.75rem, 44px)`.
5. **Controles**: dos `<select>` nativos en la cabecera con texto visible en la propia opción seleccionada (`Tema: Seguir el sistema/Claro/Oscuro`, `Texto: Normal/Grande/Muy grande`). Nativos = teclado, foco y estado accesible sin código adicional. En ≤30 rem se compactan paddings y se acorta la etiqueta visible de "Tu pedido" a "Pedido" (manteniendo `aria-label`), sin aumentar `--header-height`.
6. **Contraste**: paleta oscura con tokens semánticos; se verifican por código las parejas de texto/fondo y borde de control. Ver tabla en [research.md](research.md#paleta-y-verificación-de-contraste).
7. **Cesta intacta**: los handlers de apariencia no llaman a `addItem`, `setQuantity`, `removeLine` ni `confirmDemoOrder`; un test e2e lo demuestra con la cesta llena y con spy de peticiones de red.

## Implementation Outline (se desglosará en `tasks.md`)

1. **Test-first**: crear los tests unitarios y e2e que fallen por ausencia de módulo, atributos y controles; ejecutarlos y registrar el fallo esperado antes de implementar.
2. **Núcleo puro**: `scripts/appearance.js` con constantes, `normalizeTheme`, `normalizeTextSize`, `resolveTheme(choice, systemPrefersDark)`, `readPreferences(storage)` y `writePreference(storage, key, value)`, todos tolerantes a `Storage` que lanza excepciones.
3. **HTML**: atributos iniciales en `<html>`, `<meta name="color-scheme">`, metas `theme-color` por preferencia de sistema, script boot inline y los dos `<select>` con `<label>` accesible en la cabecera.
4. **CSS**: tokens claros/oscuros, `--font-scale`, conversión de `font-size` a tokens, estado seleccionado de los selects, foco visible en ambos temas y reglas compactas de cabecera a 360 px.
5. **Cableado UI**: `initAppearance()` llamado desde `init()` en `app.js`; sincroniza los selects con el estado, escribe preferencias, actualiza `meta theme-color` y escucha `matchMedia('(prefers-color-scheme: dark)')` solo para esa meta (el aspecto ya lo cambia CSS).
6. **Verificación**: barrido de contraste en ambos temas y tres tamaños, prueba de no-parpadeo con `addInitScript` + primer `requestAnimationFrame`, 360 px sin scroll horizontal, cesta intacta y cero peticiones al cambiar apariencia.
7. **Cierre**: `npm test` completo, comprobaciones manuales de `quickstart.md`, PR a `dev` con `Closes #N`. Las pruebas de usuarios reales (SC-001/002) quedan registradas como pendientes si no hay participantes disponibles.

## Risks & Mitigations

| Riesgo | Mitigación |
|---|---|
| Parpadeo por leer `localStorage` en un módulo diferido | Script inline síncrono antes de la hoja de estilos; e2e captura el primer fotograma. |
| Duplicidad de estado entre inline y módulo | El inline solo sanea y escribe dos atributos; la lógica reutilizable vive en `appearance.js` y se prueba por separado. El e2e comprueba que ambos coinciden. |
| Cabecera más alta con texto "Muy grande" | Escala solo tipografía, no layout; `--header-height` fijo y reglas compactas. Test e2e compara `boundingBox().height` antes/después a 360 px. |
| Contraste insuficiente en gradientes/avisos del hero | Tokens dedicados para hero, avisos y barra móvil; el helper de contraste valida extremos del gradiente y el e2e recorre elementos reales. |
| `localStorage` bloqueado | `try/catch` en lectura y escritura; estado en memoria; e2e con `Storage.prototype` forzando a lanzar. |
| Cambio del sistema en caliente | CSS media query con `data-theme="system"`; e2e usa `page.emulateMedia({ colorScheme })` y mide < 1 s. |

## Complexity Tracking

No se añade ninguna dependencia, librería ni herramienta, por lo que no hay violaciones que justificar.

| Elemento nuevo | Por qué es necesario | Alternativa más simple rechazada |
|---|---|---|
| `scripts/appearance.js` (módulo propio) | Centralizar normalización y persistencia para probarlas con Jest sin DOM y evitar lógica duplicada en el cableado. | Repetir validaciones dentro de `app.js`: no se podría probar con la config Jest actual y facilitaría divergencias con el script inline. |
| Script inline en `<head>` | Aplicar el estado antes del primer pintado; un módulo ESM es diferido y llega tarde. | Confiar solo en CSS con `prefers-color-scheme`: no permite recordar la elección manual. |
| `tests/helpers/contrast.js` | Calcular WCAG y resolver fondos para verificar el 100 % de textos/botones sin añadir paquetes. | Comprobar solo un par de colores a mano: no cubre los 9 estados ni detecta regresiones. |

### Post-design Constitution Check

El diseño sigue pasando todas las puertas: no hay dependencias nuevas, backend, API, build, datos personales ni cambios en la carta o la cesta. La apariencia se expresa con HTML/CSS/ES modules ya aprobados; `serve` continúa limitado a preview y tests; el estado se guarda solo en el dispositivo del visitante; y toda la funcionalidad nueva está cubierta por tests escritos antes de la implementación.
