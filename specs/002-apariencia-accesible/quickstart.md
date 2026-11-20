# Quickstart and Validation: Apariencia accesible

Esta guía complementa la de la [feature 001](../001-pizzeria-web/quickstart.md). El servidor local sigue siendo solo de preview y pruebas; la entrega es estática.

## Prerequisites

- Node.js 26.13.0 LTS y npm (sin cambios respecto a la feature 001).
- Chromium instalado para Playwright: `npx playwright install chromium`.
- No hay dependencias nuevas que instalar.

## Install and preview

```sh
npm ci
npx playwright install chromium
npm run start
```

Abrir `http://127.0.0.1:3000`. Para probar la preferencia del sistema, cambia el modo claro/oscuro del sistema operativo (o usa el emulador de dispositivo de DevTools) con la página abierta.

## Automated checks

```sh
npm run test:unit     # Jest: lógica pura de apariencia + carta + esquema del JSON
npm run test:e2e      # Playwright: flujos de carta + apariencia en Chromium
npm test              # ambos
```

Tests nuevos de esta feature:

- `tests/unit/appearance.test.js`: normalización de valores, resolución `system`/claro/oscuro, claves separadas y tolerancia a `Storage` que lanza excepciones.
- `tests/e2e/appearance.spec.js`:
  - primer fotograma con el tema correcto (sin parpadeo) y con el tamaño recordado;
  - defecto del sistema, elección manual, vuelta a "Seguir el sistema" y persistencia tras recarga;
  - cambio de la preferencia del sistema en caliente, con y sin elección manual;
  - niveles `Normal`/`Grande`/`Muy grande`, ratios +15 %/+30 %, 360 px sin scroll horizontal, cabecera sin crecer y botones de ≥ 44 px;
  - teclado, foco visible y estado seleccionado;
  - cesta llena intacta y **cero peticiones de red** al cambiar apariencia;
  - `localStorage` bloqueado sin errores visibles;
  - barrido de contraste AA en ambos temas y tres tamaños.

No se modifican `jest.config.mjs` ni `playwright.config.mjs`: los nuevos archivos encajan en las raíces ya configuradas.

## Manual acceptance checks

1. Con el sistema en **oscuro** y sin datos guardados, abre la web: debe verse oscura desde el primer instante. Repite con el sistema en claro y con "sin preferencia": debe verse clara.
2. Sin cambiar el sistema, elige **Oscuro**, recarga y comprueba que sigue oscura. Elige **Seguir el sistema**, recarga y comprueba que vuelve a depender del dispositivo.
3. Con la página abierta y **Seguir el sistema** activo, cambia el modo del sistema: el aspecto debe seguirlo sin recargar. Repite habiendo elegido **Claro** u **Oscuro**: no debe cambiar.
4. Cambia el texto a **Grande** y **Muy grande**: debe notarse el aumento en carta, cesta, avisos, barra móvil y botones. Recarga: debe conservarse. Reduce hasta **Normal**.
5. En un móvil de 360 px con **Muy grande**, recorre todas las secciones: sin desplazamiento horizontal, sin solapes, botones cómodos y cabecera de la misma altura.
6. Usa solo el teclado para recorrer y cambiar ambos controles: foco visible, opciones entendibles y estado seleccionado claro.
7. Llena la cesta, cambia tema y tamaño y comprueba que líneas, cantidades y total siguen idénticos; la confirmación sigue siendo solo de demostración.
8. Activa el modo de navegación restringido o bloquea el almacenamiento del sitio: los controles deben seguir funcionando en esa visita sin mensajes de error.
9. Comprueba que no se piden datos personales y que no se produce ninguna petición de red al cambiar de apariencia (DevTools → Network).

## Validation record

Fecha: 2026-11-20. Entorno: Node v26.13.0, npm 11.20.0, Playwright 1.65.0 con Chromium 158.0.8127.18 (build 1254), instalado con `npx playwright install chromium` tras `npm ci`.

### Automated checks

| Comprobación | Estado |
|---|---|
| `npm run test:unit` | Correcto — Jest 43/43 en 4 suites |
| `npm run test:e2e` | Correcto — Playwright 35/35 en Chromium |
| `npm test` | Correcto — 78 pruebas en total |

### Acceptance checks (SC-003 a SC-009)

| Criterio | Evidencia | Estado |
|---|---|---|
| SC-003 Sin parpadeo de tema ni tamaño | 30 cargas (2 preferencias del sistema × 3 elecciones de tema × 5 repeticiones) con captura en el primer `requestAnimationFrame`: 30/30 correctas, 0 tema o tamaño equivocados. | Correcto |
| SC-004 Persistencia 5/5 | 5 recargas consecutivas con `dark` + `large`: 5/5 conservan atributos y ambas claves. | Correcto |
| SC-005 Contraste AA 100 % | Barrido a 360 px de 37 selectores de texto y 6 bordes en 9 combinaciones (3 temas × 3 tamaños), incluidos avisos de éxito/error y barra móvil: todos ≥ 4,5:1 / 3:1. | Correcto |
| SC-006 360 px / Muy grande | `scrollWidth === clientWidth`, cabecera en 60 px con y sin ampliación, 0 controles fuera de pantalla y 0 zonas pulsables por debajo de 44 px. | Correcto |
| SC-007 Cambio del sistema < 1 s | `page.emulateMedia({ colorScheme })` cambia el fondo en el acto sin recargar; el test mide < 1 s. | Correcto |
| SC-008 Cero peticiones/pedidos/datos | Spy de `request` durante los cambios de apariencia: 0 peticiones; no se dispara la confirmación; `localStorage` bloqueado no genera errores. | Correcto |
| SC-009 Cesta intacta 5/5 | 5 ciclos de cambio de tema y tamaño con dos líneas en la cesta: 5/5 mantienen nombres, cantidades, subtotales y total. | Correcto |

Las comprobaciones manuales 1–9 se han ejecutado en Chromium con emulación de la preferencia del sistema; el cambio real del sistema operativo no estaba disponible en este entorno, por lo que SC-007 se validó con `page.emulateMedia`.

### Usability study (SC-001, SC-002)

**Pendiente — requiere cinco participantes reales.** Igual que en la feature 001, registrar una fila por persona; al menos 4 de 5 deben encontrar y cambiar tema y texto en < 20 s y valorar los controles con 4–5/5. No se ha podido realizar en esta sesión de implementación: no había participantes disponibles.

| Participante | Cambia a oscuro y amplía texto (< 20 s) | Facilidad (4–5/5) |
|---|---|---|
| P1 | Pendiente | Pendiente |
| P2 | Pendiente | Pendiente |
| P3 | Pendiente | Pendiente |
| P4 | Pendiente | Pendiente |
| P5 | Pendiente | Pendiente |

### Nota de entorno

La planificación se hizo con Node v24.19.0 y sin `node_modules/`, por debajo del requisito `>=26.13.0 <27`. Para la implementación se instaló Node v26.13.0 con nvm, se ejecutó `npm ci` y se descargó Chromium. Los visitantes de la web no necesitan Node: la entrega sigue siendo estática.

## Updating appearance behaviour

Los colores viven en `styles/site.css` como tokens; los tamaños, en `--font-scale` y los tokens `--fs-*`; las preferencias, en `scripts/appearance.js` y las dos claves documentadas en [data-model.md](data-model.md). No hay contenido de apariencia en `data/menu.json`, por lo que el personal no necesita tocar la carta para cambiar estos ajustes.
