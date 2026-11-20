# Tasks: Apariencia accesible (modo oscuro y texto ampliable)

**Input**: Design documents in `specs/002-apariencia-accesible/`

**Prerequisites**: `plan.md` y `spec.md`; también `research.md`, `data-model.md`, `contracts/appearance.md` y `quickstart.md`.

**Tests**: Requeridos por el principio III de la constitución (test-first). Cada tarea de test debe ejecutarse y **fallar** antes de la tarea de implementación que la resuelve.

**Organization**: Tareas agrupadas por historia de usuario para que cada incremento se pueda implementar y validar por separado. Trabajar en `issue/apariencia-accesible`, creada desde `origin/dev`.

## Formato

- Cada tarea usa `- [ ] Tnnn`. `[P]` indica que toca archivos distintos y puede ejecutarse en paralelo; `[USn]` identifica la historia.
- Toda tarea incluye la ruta exacta y una `Verificación:` comprobable con un comando o una observación concreta.
- No se añaden dependencias, build, backend, datos personales ni cambios en `data/menu.json` o `scripts/cart.js`.

---

## Phase 1: Setup y compuerta de pruebas

**Purpose**: Confirmar el punto de partida verde y crear los helpers/tests que fallarán antes de tocar la aplicación.

- [x] T001 [P] Verificar el baseline antes de cualquier cambio: con Node 26.13.0 y npm, ejecutar `npm ci`, `npx playwright install chromium` y `npm test`. Verificación: salida limpia, Jest 15/15 y Playwright 23/23; registrar versiones de Node y Chromium en la ejecución.
- [x] T002 [P] Crear `tests/unit/contrast.test.js` con casos fallidos que importen `tests/helpers/contrast.js` (aún inexistente): ratio conocido `#1f1a17`/`#fbf6ee` ≈ 16.02, borde oscuro `#7d675b`/`#241c18` ≈ 3.16, umbrales `meetsAA(ratio, false)` = 4.5 y `meetsAA(ratio, true)` = 3, y entrada inválida. Verificación: `npm run test:unit -- tests/unit/contrast.test.js` falla por módulo no encontrado.
- [x] T003 [P] Crear `tests/helpers/contrast.js` con `contrastRatio(hexA, hexB)` y `meetsAA(ratio, isLargeText)` usando la fórmula WCAG documentada en `research.md`, sin dependencias. Verificación: `npm run test:unit -- tests/unit/contrast.test.js` pasa.
- [x] T004 [P] Crear `tests/unit/appearance.test.js` con casos fallidos para `scripts/appearance.js` (aún inexistente): constantes de tema/tamaño, `normalizeTheme` y `normalizeTextSize` con valores inválidos, `resolveTheme(choice, prefersDark)`, `readPreferences(storage)`, `writePreference(storage, key, value)` con almacén falso y con `getItem`/`setItem` que lanzan excepción. Verificación: `npm run test:unit -- tests/unit/appearance.test.js` falla por módulo no encontrado.
- [x] T005 Crear `scripts/appearance.js` con la API pura necesaria para T004: constantes, normalización, resolución y persistencia tolerante a fallos; sin DOM, sin `fetch` y sin importar `app.js` ni `cart.js`. Verificación: `npm run test:unit -- tests/unit/appearance.test.js` pasa y `npm run test:unit` sigue en verde.

**Checkpoint**: Existe una compuerta de fallo demostrada para el código nuevo; el helper de contraste y el núcleo puro ya pasan sus pruebas antes de tocar la página.

---

## Phase 2: Foundational — atributos y arranque sin parpadeo

**Purpose**: Fijar el contrato de atributos en `<html>` y el arranque síncrono del que dependen las tres historias.

- [x] T006 [P] Añadir a `tests/e2e/appearance.spec.js` un test fallido de smoke: tras `page.goto('/')`, `<html>` expone `data-theme` y `data-text-size` con valores permitidos y no hay errores en la consola. Verificación: `npm run test:e2e -- tests/e2e/appearance.spec.js -g "smoke"` falla.
- [x] T007 En `index.html` añadir los atributos iniciales en `<html>`, `<meta name="color-scheme">`, las metas `theme-color` por preferencia de sistema y el script inline síncrono (antes de `<link rel="stylesheet">`) que sanea las dos claves y escribe ambos atributos antes del primer pintado. Verificación: el test de T006 pasa y no aparece ninguna petición de red nueva en DevTools.

**Checkpoint**: La base está lista; cualquier historia puede implementarse encima sin parpadeo del estado inicial.

---

## Phase 3: User Story 1 — Leer la carta de noche con aspecto oscuro (Priority: P1) 🎯 MVP

**Goal**: Respetar la preferencia del sistema, permitir elegir Claro/Oscuro/Seguir el sistema, recordar la elección y cambiar en caliente sin recargar.

**Independent Test**: Probar solo el tema, sin tocar el tamaño de texto: emular sistema claro/oscuro, elegir cada opción, recargar y cambiar la preferencia del sistema con la página abierta.

### Tests for User Story 1

- [x] T008 [US1] Añadir en `tests/e2e/appearance.spec.js` tests fallidos para el estado inicial: sistema oscuro → oscuro sin elección previa; sistema claro o sin preferencia → claro; y captura del primer `requestAnimationFrame` mediante `addInitScript` para demostrar que no aparece el tema equivocado. Verificación: ejecutar el archivo con `-g "inicial"` y observar fallo.
- [x] T009 [US1] Añadir en `tests/e2e/appearance.spec.js` tests fallidos para elección manual: `Claro`/`Oscuro` prevalecen sobre el sistema y persisten tras recarga; `Seguir el sistema` vuelve a depender del dispositivo y también persiste; el cambio de sistema en caliente se aplica solo con `Seguir el sistema`. Verificación: ejecutar con `-g "tema manual"` y observar fallo.

### Implementation for User Story 1

- [x] T010 [P] [US1] En `styles/site.css` crear los tokens claros/oscuros y los bloques `:root[data-theme="dark"]` y `@media (prefers-color-scheme: dark) { :root[data-theme="system"] { … } }`, migrando a tokens los colores literales de cabecera, hero, avisos, total y barra móvil según `research.md`. Verificación: T008 pasa; T009 sigue fallando hasta T012 porque aún no existen los controles.
- [x] T011 [P] [US1] En `index.html` añadir en la cabecera el `<select data-appearance="theme">` con su `<label>` y las opciones exactas `Seguir el sistema`, `Claro`, `Oscuro`, con `name`/`id` coherentes. Verificación: el control es visible en escritorio y existe en el DOM en 360 px; T009 sigue fallando hasta T012.
- [x] T012 [US1] En `scripts/app.js` crear o ampliar `initAppearance()` para sincronizar el select con `data-theme`, escribir `fratelli.appearance.theme`, actualizar la meta `theme-color` y escuchar `matchMedia('(prefers-color-scheme: dark)')` solo para esa meta cuando el tema sea `system`. Verificación: T009 pasa; la sección `initAppearance()` y sus handlers solo escriben atributos, claves de apariencia y la meta `theme-color` (el resto del archivo conserva la cesta de la feature 001).

**Checkpoint**: US1 funciona de forma aislada: sistema, elección manual y persistencia del tema, sin tocar el texto ni la cesta.

---

## Phase 4: User Story 2 — Ampliar el texto de forma sencilla (Priority: P1)

**Goal**: Ofrecer Normal/Grande/Muy grande con palabras claras, +15 %/+30 % medibles, persistencia y buen comportamiento a 360 px.

**Independent Test**: Probar solo el texto sin cambiar de tema: medir tamaños calculados, recargar, reducir y revisar el layout en móvil pequeño.

### Tests for User Story 2

- [x] T013 [US2] Añadir en `tests/e2e/appearance.spec.js` tests fallidos para los tres niveles: el control muestra el nivel elegido, el `font-size` calculado de cuerpo y botones es 1.15× y 1.30× el de Normal, se puede volver a Normal, se recuerda tras recarga y no aparece el tamaño Normal en el primer fotograma si había una elección guardada. Verificación: ejecutar con `-g "texto niveles"` y observar fallo.
- [x] T014 [US2] Añadir en `tests/e2e/appearance.spec.js` tests fallidos a 360 px con `Muy grande`: `scrollWidth === clientWidth` en `document.documentElement`, altura de `.site-header` igual a la medida con Normal, `getBoundingClientRect().height >= 44` en botones y selects, y ausencia de solapes entre cabecera, navegación de categorías y barra móvil. Verificación: ejecutar con `-g "texto 360"` y observar fallo.

### Implementation for User Story 2

- [x] T015 [P] [US2] En `styles/site.css` definir `--font-scale` para `normal|large|xlarge` (`1|1.15|1.30`) y los tokens `--fs-*` del `data-model.md`; convertir cada `font-size` existente a `calc(var(--fs-*) * var(--font-scale))` sin escalar espaciados ni `--header-height`. Verificación: T013 pasa y T009 sigue en verde.
- [x] T016 [US2] En `styles/site.css` añadir las reglas compactas de cabecera para ≤48 rem, ≤30 rem y ≤26 rem y fijar el mínimo táctil con `min-height: max(2.75rem, 44px)` en botones, selects y campos de cantidad. Verificación: T014 pasa sin scroll horizontal y sin crecer la cabecera.
- [x] T017 [P] [US2] En `index.html` añadir el `<select data-appearance="text-size">` con `<label>` y opciones exactas `Normal`, `Grande`, `Muy grande`; en `scripts/app.js` ampliar `initAppearance()` para sincronizarlo, escribir `fratelli.appearance.textSize` y actualizar `data-text-size` sin modificar `data-theme`. Verificación: T013 y T014 pasan; cambiar el tamaño no altera el tema elegido en T009.

**Checkpoint**: US2 funciona de forma aislada y combinada con US1; las nueve combinaciones tema × tamaño son estables.

---

## Phase 5: User Story 3 — Encontrar y usar los controles con confianza (Priority: P2)

**Goal**: Controles evidentes, utilizables con teclado, sin pérdida de pedido, sin peticiones y con contraste AA en toda la interfaz.

**Independent Test**: Llenar la cesta y cambiar tema y tamaño solo con teclado; comprobar foco, estado seleccionado, total intacto, red silenciosa y contraste.

### Tests for User Story 3

- [x] T018 [US3] Añadir en `tests/e2e/appearance.spec.js` tests fallidos de uso con teclado: ambos selects se alcanzan con `Tab`, muestran foco visible con `--color-focus`, se activan con teclado y el valor seleccionado se anuncia; repetir en tema claro y oscuro. Verificación: ejecutar con `-g "teclado"` y observar fallo.
- [x] T019 [US3] Añadir en `tests/e2e/appearance.spec.js` tests fallidos de seguridad de datos: con dos líneas en la cesta, cambiar tema y tamaño mantiene líneas, cantidades y total; no se emite ningún `request` durante el cambio; forzar `Storage.prototype.getItem/setItem` a lanzar excepción mediante `addInitScript` y comprobar que no aparece texto de error. Verificación: ejecutar con `-g "cesta red storage"` y observar fallo.
- [x] T020 [US3] Añadir en `tests/e2e/appearance.spec.js` un test fallido de barrido de contraste que use `tests/helpers/contrast.js` sobre todos los elementos visibles con texto y botones de carta, cesta, avisos, barra móvil y contacto, en los 9 estados; los elementos con gradiente se validan contra los extremos documentados. Verificación: ejecutar con `-g "contraste"` y observar fallo.

### Implementation for User Story 3

- [x] T021 [P] [US3] Ajustar `index.html` y `styles/site.css` para que las etiquetas escritas de ambos selects sean visibles, `:focus-visible` use `--color-focus` con contraste suficiente en ambos temas y la opción elegida sea perceptible visualmente y para tecnología de asistencia. Verificación: T018 pasa.
- [x] T022 [P] [US3] Revisar `scripts/app.js` y confirmar que `initAppearance()` y sus handlers solo escriben atributos, claves de almacenamiento y la meta `theme-color`; no tocar `scripts/cart.js`. Verificación: T019 pasa y `git diff -- scripts/cart.js` está vacío.
- [x] T023 [US3] Corregir en `styles/site.css` cualquier color literal o par que falle el barrido de T020 hasta cumplir 4.5:1 en texto normal y 3:1 en texto grande y bordes de control en los 9 estados. Verificación: T020 pasa y T008/T009/T013/T014 siguen en verde. No hizo falta corregir ningún par: la paleta de `research.md` ya cumplía todos los umbrales.

**Checkpoint**: Las tres historias funcionan juntas y son independientemente verificables; no hay regresiones en la carta ni en la cesta.

---

## Phase 6: Polish y validación

**Purpose**: Documentar, ejecutar la suite completa y cerrar los criterios de éxito medibles.

- [x] T024 [P] Actualizar `README.md`: añadir los controles de apariencia, las dos claves de `localStorage`, la ausencia de envío de datos y `scripts/appearance.js` en el árbol de estructura. Verificación: la sección "Estructura" y la descripción inicial mencionan la nueva funcionalidad sin contradecir el flujo de demostración.
- [x] T025 [P] Rellenar en `specs/002-apariencia-accesible/quickstart.md` la tabla "Automated checks" con el resultado real de Jest y Playwright, incluyendo versiones de Node y Chromium. Verificación: no queda ninguna celda "Pendiente" en esa tabla.
- [x] T026 Ejecutar `npm test` completo con Node 26.13.0 y Chromium instalado. Verificación: todos los tests de `cart.test.js`, `menu-data.test.js`, `contrast.test.js`, `appearance.test.js`, `menu.spec.js` y `appearance.spec.js` pasan; registrar el total.
- [x] T027 Ejecutar las comprobaciones manuales 1–9 de `specs/002-apariencia-accesible/quickstart.md` en Chromium, en escritorio y a 360 px, incluido el cambio de preferencia del sistema desde el sistema operativo. Verificación: cada paso queda anotado como Correcto/Incorrecto en el registro de validación.
- [x] T028 Ejecutar el estudio de usabilidad SC-001 y SC-002 con cinco participantes; si no hay participantes disponibles, dejar la tabla de `quickstart.md` marcada explícitamente como pendiente con el motivo. Verificación: la tabla está completa o tiene el estado pendiente justificado.
- [x] T029 Crear el PR contra `dev` con `Closes #5`, título Conventional Commit (`feat: apariencia accesible…`) y referencia a este `tasks.md`. Verificación: PR #15 abierto contra `dev` desde el fork (la sesión local de `gh` solo tiene permiso de lectura en el repositorio de la organización); no se ha hecho push a `main` ni a `dev`; el PR incluye los artefactos de Spec Kit y `npm test` está en verde (78/78). El workflow de CI quedó en `action_required`: GitHub pide la aprobación de un mantenedor al ser el primer PR desde este fork.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: T001 va primero; T002, T003 y T004 pueden prepararse en paralelo, pero T003 depende de que T002 exista para saber qué debe satisfacer; T005 depende de T004.
- **Phase 2**: T006 depende de T005 solo para el contrato de valores; T007 depende de T006 y bloquea las tres historias.
- **User Stories (Phases 3–5)**: US1 empieza tras Phase 2. US2 puede empezar tras Phase 2, pero se ejecuta después de US1 para evitar ediciones concurrentes en `index.html`, `styles/site.css` y `scripts/app.js`. US3 se ejecuta al final porque usa los controles y estilos de US1 y US2.
- **Phase 6**: depende de que T008–T023 estén completos. T024 y T025 son paralelos; T026 va después de ambos; T027, T028 y T029 van en ese orden.

### Within Each User Story

- Los tests se escriben y ven fallar antes de cualquier implementación de esa historia.
- En US1: estilos (T010) y markup del select (T011) pueden ir en paralelo; el cableado (T012) va después.
- En US2: los tokens de texto (T015), las reglas de 360 px (T016) y el cableado del select (T017) pueden prepararse en paralelo porque tocan archivos distintos, pero T016 debe verificarse después de T015 si comparte `site.css`.
- En US3: T021 y T022 son paralelos; T023 va después para no competir por `site.css`.

### Parallel Opportunities

- T002 y T004 escriben archivos de test distintos; T003 puede avanzar en el helper mientras T004 se completa.
- T010 y T011 tocan `site.css` e `index.html` respectivamente.
- T015 y T017 tocan `site.css`/`index.html`+`app.js`; T016 comparte `site.css` con T015, por lo que se ejecuta después.
- T021 y T022 tocan estilos/markup y `app.js` respectivamente.
- T024 y T025 actualizan documentación distinta.

## Implementation Strategy

### MVP First (US1)

1. Completar Phase 1 y Phase 2.
2. Completar T008–T012 y validar solo el tema: defecto del sistema, manual, persistencia y cambio en caliente.
3. Detenerse antes de tocar el tamaño de texto y comprobar que la cesta sigue igual.

### Incremental Delivery

1. Fundación → atributos y arranque sin parpadeo.
2. US1 → tema oscuro accesible y respetuoso con el sistema.
3. US2 → texto ampliable y móvil de 360 px.
4. US3 → controles evidentes, seguros y con contraste AA.
5. Polish → documentación, suite completa, manual checks, usabilidad y PR.

## Notes

- `[P]` significa archivos distintos y sin dependencia parcial; en caso de duda, ejecutar en secuencia.
- No ejecutar estas tareas en el entorno actual con Node 24.19.0: T001 exige Node 26.13.0, `npm ci` y Chromium.
- Los tests son obligatorios por la constitución; no marcar una tarea de implementación como completada si su test no se ha visto fallar primero.
- No se crean pedidos, pagos, datos personales ni peticiones externas; el estado solo vive en el dispositivo del visitante.
- No hacer commit todavía: agrupar los cambios por historia con Conventional Commits y abrir el PR contra `dev` en T029.
