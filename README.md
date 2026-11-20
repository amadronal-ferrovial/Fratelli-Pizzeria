# Fratelli-Pizzeria

Repositorio con fines educativos, utilizado para hacer onboardings de tecnología SDD. Simula la web de la pizzeria Fratelli, para que puedan practicar los developers.

La web es una página estática en español (HTML, CSS y módulos JavaScript, sin framework ni paso de compilación) que muestra la carta de comida de Pizzería Fratelli, el teléfono y la dirección, y un **pedido de demostración**: la cesta vive solo en memoria y al confirmar no se envía nada al restaurante, no se cobra y no se piden datos personales. La cabecera incluye controles visibles para elegir el **tema** (Seguir el sistema / Claro / Oscuro) y el **tamaño del texto** (Normal / Grande / Muy grande); ambas preferencias se recuerdan solo en este navegador y no se envían a ningún servicio.

## Requisitos

- Node.js 26.13.0 LTS (rango admitido `>=26.13.0 <27`) y npm. Node solo se usa para la vista previa local y los tests; los visitantes no lo necesitan.
- Chromium para Playwright (se descarga una vez con `npx playwright install chromium`).

## Vista previa local

```sh
npm ci
npm run start
```

Abre <http://127.0.0.1:3000>. El servidor (`serve`) escucha solo en `127.0.0.1:3000`, no cambia de puerto si está ocupado y no copia nada al portapapeles. Es una herramienta de desarrollo, **no** un servidor de producción.

## Apariencia y accesibilidad

Los dos controles de la cabecera funcionan sin recargar y se recuerdan por separado en `localStorage`:

| Control | Clave guardada | Valores |
|---|---|---|
| Tema | `fratelli.appearance.theme` | `system`, `light`, `dark` |
| Texto | `fratelli.appearance.textSize` | `normal`, `large`, `xlarge` |

Sin elección previa se sigue la preferencia del sistema; si el sistema no indica ninguna, se muestra el aspecto claro. Elegir «Seguir el sistema» vuelve a depender del dispositivo, también cuando cambia con la página abierta. «Normal» es el tamaño actual, «Grande» lo aumenta un 15 % y «Muy grande» un 30 %.

El estado se fija con un script síncrono en `<head>` antes de la hoja de estilos, para evitar parpadeos. El tema se resuelve con `data-theme` y variables CSS; el tamaño, con `--font-scale`. Si el navegador bloquea `localStorage`, los controles siguen funcionando durante la visita sin mostrar errores. Cambiar la apariencia no toca la cesta, no crea pedidos ni envía peticiones: no se recogen datos personales.

## Tests

```sh
npx playwright install chromium   # solo la primera vez
npm run test:unit                 # Jest: cesta, apariencia, contraste y validación de data/menu.json
npm run test:e2e                  # Playwright (Chromium): carta, cesta y apariencia
npm test                          # ambos
```

Playwright arranca `npm run start` automáticamente. Jest se ejecuta en modo ESM nativo con `--experimental-vm-modules` (sin Babel ni jsdom).

## Estructura

```text
index.html             Estructura semántica de la página
styles/site.css        Estilos (fuentes del sistema, sin recursos externos)
scripts/app.js         Carga data/menu.json, gestiona la interfaz y conecta los controles de apariencia
scripts/appearance.js  Normalización y persistencia de tema y tamaño, sin DOM (probada con Jest)
scripts/cart.js        Reglas de cesta y precios, sin DOM (probadas con Jest)
data/menu.json         Restaurante y carta de comida
tests/unit/            Tests de Jest
tests/e2e/             Tests de Playwright
tests/helpers/         Cálculo de contraste WCAG sin dependencias nuevas
```

## Actualizar la carta y los datos del restaurante

No hay pantalla de gestión: el contenido se edita en `data/menu.json` siguiendo el esquema de [`specs/001-pizzeria-web/data-model.md`](specs/001-pizzeria-web/data-model.md).

1. Comprueba los cambios en las fuentes enlazadas en `sources` (carta de Tipsi y perfil de Tripadvisor). Solo se publica la carta de comida; la de bebidas queda fuera.
2. Edita `data/menu.json`:
   - Los precios van en **céntimos de euro** (`"priceCents": 1045` = 10,45 €).
   - Cada producto necesita un `id` único, un `categoryId` existente, `name`, `available` y al menos un formato. Si tiene varios formatos, el cliente deberá elegir uno.
   - Pon `description` solo si existe en la fuente; no inventes datos.
   - Usa `"available": false` para productos agotados: se muestran, pero no se pueden añadir.
   - Las imágenes (`image` en productos, `bannerImage` en el restaurante) son opcionales: solo se añaden con derechos de uso confirmados, como archivo local optimizado en `assets/images/` y con texto alternativo.
3. Actualiza `sources.verifiedOn` con la fecha de verificación.
4. Ejecuta `npm test`: valida el esquema del JSON y que la web muestra cada producto con su precio.

## Despliegue

El resultado son archivos estáticos (`index.html`, `styles/`, `scripts/`, `data/` y, si existe, `assets/`). Pueden publicarse en cualquier alojamiento de ficheros estáticos; elegir y configurar el proveedor queda fuera del alcance de este proyecto. No hay backend, API ni integración en tiempo real con Tipsi o Tripadvisor.
