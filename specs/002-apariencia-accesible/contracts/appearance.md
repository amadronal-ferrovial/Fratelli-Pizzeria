# Appearance UI Contract

Extensión del [contrato de UI de la feature 001](../001-pizzeria-web/contracts/ui.md). No lo sustituye: carta, cesta y contacto siguen comportándose igual.

## Page surface

- La cabecera contiene dos controles visibles y permanentes, con texto escrito, para cambiar **tema** y **tamaño del texto**. No se usan solo iconos.
- Los controles están disponibles desde cualquier sección (carta, pedido, contacto) sin desplazarse y sin abrir menús ocultos.
- En pantallas pequeñas los controles se compactan sin aumentar la altura de la cabecera y sin provocar desplazamiento horizontal.
- El aspecto cubre toda la interfaz: cabecera, hero, navegación de categorías, tarjetas de producto, cesta, avisos de éxito/error, total, barra móvil "Ver tu pedido", contacto y pie de página.

## Theme control

- Tres opciones, con estas etiquetas visibles exactas: **Seguir el sistema**, **Claro**, **Oscuro**.
- Sin elección previa: se aplica la preferencia del sistema; si el dispositivo no indica ninguna, se aplica el aspecto claro actual.
- Elegir **Claro** u **Oscuro** aplica ese aspecto de inmediato, lo recuerda y prevalece sobre el sistema, también en visitas posteriores.
- Elegir **Seguir el sistema** deja sin efecto la elección manual, recupera la preferencia actual del dispositivo y recuerda esa decisión.
- Si el sistema cambia de preferencia con la página abierta:
  - con **Seguir el sistema** activo, el aspecto cambia solo, sin recargar, en menos de un segundo;
  - con **Claro** u **Oscuro** activos, el aspecto no cambia.
- La opción seleccionada se ve en el control cerrado y se anuncia como estado seleccionado a tecnología de asistencia.

## Text size control

- Tres niveles, con estas etiquetas visibles exactas: **Normal**, **Grande**, **Muy grande**.
- **Normal** = tamaño actual; **Grande** = +15 %; **Muy grande** = +30 %. Se puede aumentar, reducir y volver al inicial.
- El cambio afecta a textos, precios, botones, selects, campos de cantidad y zonas pulsables de toda la interfaz. Las zonas pulsables mantienen al menos 44 px.
- Con **Muy grande** en un móvil de 360 px: no hay desplazamiento horizontal, no hay solapes, los botones siguen siendo pulsables y la cabecera conserva su altura.
- El tamaño elegido se aplica desde el primer momento visible y se recuerda por separado del tema.

## Keyboard and assistive technology

- Ambos controles se pueden enfocar y activar con teclado; el foco es visible en ambos temas.
- Cada control tiene un nombre accesible asociado con su `<label>`; la opción elegida es el valor del control.
- Los cambios de apariencia no mueven el foco a otra sección y no interrumpen la lectura de la carta.
- Si el navegador impide guardar la preferencia, los controles siguen funcionando durante la visita y no aparece ningún mensaje de error.

## Visual contract

- En ambos temas y en los tres tamaños, todos los textos, precios, avisos, botones y bordes de control alcanzan WCAG AA: 4,5:1 para texto normal y 3:1 para texto grande y bordes de controles.
- Los tokens de color, la paleta oscura y los ratios verificados se definen en [research.md](../research.md#paleta-y-verificación-de-contraste). Ningún componente introduce un color literal nuevo.
- El cambio de tema no usa animaciones llamativas; se respeta `prefers-reduced-motion`.

## Implementation-facing DOM contract

Estos atributos son internos, pero forman parte del contrato observable por tests:

| Elemento | Atributo/valor | Cuándo |
|---|---|---|
| `<html>` | `data-theme="system" \| "light" \| "dark"` | Fijado por el script inline antes del primer pintado; actualizado por el módulo al cambiar el control. |
| `<html>` | `data-text-size="normal" \| "large" \| "xlarge"` | Igual que arriba. |
| `<select data-appearance="theme">` | valor `system` / `light` / `dark` | Sincronizado con `data-theme`. |
| `<select data-appearance="text-size">` | valor `normal` / `large` / `xlarge` | Sincronizado con `data-text-size`. |
| `<meta name="theme-color">` | color del tema efectivo | Actualizado al cargar, al elegir tema y, si aplica `system`, al cambiar el sistema. |

Claves de almacenamiento: `fratelli.appearance.theme` y `fratelli.appearance.textSize`. Solo se escriben esas dos cadenas; no se almacena el tema resuelto.

## Cart and data invariants

- Cambiar tema o tamaño no vacía la cesta, no cambia cantidades ni totales y no dispara la confirmación de demostración.
- No se crean pedidos, pagos ni registros de cliente.
- No se piden datos personales ni se envían las preferencias a ningún servicio. El único "recuerdo" es `localStorage` del mismo origen.
- No se modifica `data/menu.json`; no se añaden bebidas, extras ni productos nuevos.

## External interface boundary

La página sigue sin exponer API pública. No hay peticiones de red nuevas: ni al cargar el estado, ni al cambiar tema, ni al cambiar tamaño. Las únicas navegaciones externas siguen siendo las acciones de teléfono y mapa de la feature 001.
