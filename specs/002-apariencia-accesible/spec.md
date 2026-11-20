# Feature Specification: Apariencia accesible (modo oscuro y texto ampliable)

**Feature Branch**: `002-apariencia-accesible` (rama de trabajo Git: `issue/apariencia-accesible`)

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Contexto: La web solo tiene un aspecto. Hay clientes que usan el móvil de noche, o que necesitan letra más grande o más contraste para leer la carta con comodidad. Qué se necesita: Un modo oscuro, que respete la preferencia del sistema del usuario y que este pueda cambiar manualmente. Una forma sencilla de aumentar el tamaño del texto. La elección del usuario debe recordarse en su próxima visita. A tener en cuenta: Ambos modos deben tener contraste suficiente en todos los textos y botones. No debe aparecer un 'parpadeo' del tema equivocado al cargar la página. Los controles deben ser evidentes para alguien poco habituado a la tecnología. Pistas para tu spec: ¿Qué ocurre si el usuario nunca ha elegido nada? ¿Y si cambia la preferencia del sistema mientras la web está abierta? Nivel y público: Apto para todos los perfiles, incluidos quienes no programan."

## Clarifications

### Session 2026-11-20

- Q: ¿Qué aspecto se muestra cuando el visitante nunca ha elegido un tema? → A: El que indique la preferencia del sistema del dispositivo; si el sistema no expresa preferencia, se mantiene el aspecto claro actual.
- Q: ¿Puede el visitante volver a seguir la preferencia del sistema después de haber elegido un tema manualmente? → A: Sí. Se ofrecen tres opciones con palabras: "Seguir el sistema", "Claro" y "Oscuro"; elegir "Seguir el sistema" deja sin efecto la elección manual.
- Q: ¿Qué ocurre si la preferencia del sistema cambia mientras la web está abierta? → A: La web sigue el nuevo valor automáticamente solo mientras no haya una elección manual activa. Si el visitante eligió "Claro" u "Oscuro", su elección se mantiene hasta que elija "Seguir el sistema".
- Q: ¿Cómo se presenta el cambio de tamaño de texto a alguien poco habituado a la tecnología? → A: Con un control visible con etiquetas escritas y tres niveles comprensibles —"Normal", "Grande" y "Muy grande"— que permita aumentar, reducir y volver al tamaño inicial; sin controles deslizantes ni términos técnicos.
- Q: ¿El tema y el tamaño del texto son una sola preferencia? → A: No. Se recuerdan por separado y cambiar uno no modifica el otro.
- Q: ¿Qué ocurre con el pedido de demostración al cambiar de apariencia? → A: Nada. Las líneas, las cantidades y el total se conservan; estos controles solo cambian la apariencia.
- Q: ¿Se piden datos personales para recordar la elección? → A: No. La elección se guarda únicamente en el navegador o dispositivo del visitante; no se crea una cuenta ni se envía a ningún servicio.
- Q: ¿Dónde deben estar los controles de tema y tamaño de texto? → A: En la cabecera, siempre visibles junto a la navegación. En pantallas pequeñas se compactan sin aumentar la altura de la cabecera.
- Q: ¿Qué significado concreto tienen "Grande" y "Muy grande"? → A: "Normal" mantiene el tamaño actual; "Grande" lo aumenta un 15 % y "Muy grande" un 30 %, con valores fijos y verificables.
- Q: Además del tema, ¿debe evitarse que el texto cambie de tamaño al cargar? → A: Sí. La página se abre directamente con el tema y el tamaño recordados, sin mostrar antes un tema ni un tamaño equivocados.
- Q: Al aumentar el texto, ¿deben crecer también los botones y las zonas pulsables? → A: Sí. Botones y zonas pulsables se adaptan para seguir siendo cómodos y mantener al menos 44 px de área.
- Q: ¿El tema y el tamaño deben aplicarse también a los avisos del pedido y a la barra móvil "Ver tu pedido"? → A: Sí, a toda la interfaz, incluidos avisos de éxito y error, la cesta y la barra flotante de pedido.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leer la carta de noche con un aspecto oscuro (Priority: P1)

Como cliente que usa el móvil de noche, quiero que la web pueda mostrarse oscura para leer la carta sin deslumbramiento.

**Why this priority**: Es la necesidad directa que origina la funcionalidad y afecta a la lectura de toda la carta, la cesta y el contacto.

**Independent Test**: Se puede comprobar sin cambiar el tamaño del texto: abrir la web con distintas preferencias del sistema, cambiar entre "Claro", "Oscuro" y "Seguir el sistema", cerrar y volver a abrir.

**Acceptance Scenarios**:

1. **Given** que el visitante nunca ha elegido un tema y su sistema indica preferencia oscura, **When** abre la web, **Then** ve la carta con aspecto oscuro desde el primer momento, sin que aparezca antes el aspecto claro.
2. **Given** que el visitante nunca ha elegido un tema y su sistema indica preferencia clara o no indica ninguna, **When** abre la web, **Then** ve el aspecto claro actual.
3. **Given** que está viendo la web con aspecto claro, **When** elige la opción visible "Oscuro", **Then** toda la interfaz —cabecera, carta, cesta, avisos de éxito y error, barra móvil "Ver tu pedido", contacto y botones— pasa a aspecto oscuro de inmediato y la opción elegida aparece claramente marcada.
4. **Given** que eligió "Oscuro" o "Claro", **When** abre la web en una visita posterior, **Then** ve el aspecto que eligió, aunque la preferencia del sistema sea distinta.
5. **Given** que eligió "Claro" u "Oscuro" manualmente, **When** elige "Seguir el sistema", **Then** la web vuelve a adaptarse a la preferencia del sistema y esa decisión se conserva en visitas posteriores.
6. **Given** que el visitante no ha elegido tema y tiene la web abierta, **When** cambia la preferencia de tema en su sistema, **Then** el aspecto de la web cambia para seguir la nueva preferencia sin recargar la página.
7. **Given** que el visitante eligió manualmente un tema y tiene la web abierta, **When** cambia la preferencia del sistema, **Then** el aspecto elegido se mantiene.

---

### User Story 2 - Ampliar el texto de forma sencilla (Priority: P1)

Como cliente que necesita letra más grande, quiero un control fácil de entender para ampliar el texto de toda la web y volver a dejarlo como estaba.

**Why this priority**: Junto con el contraste, es el otro requisito directo para que clientes con dificultades de lectura puedan usar la carta con comodidad.

**Independent Test**: Se puede comprobar sin cambiar de tema: usar el control de tamaño en la carta, la cesta y el contacto, cerrar la página y volver a abrirla.

**Acceptance Scenarios**:

1. **Given** que la web se abre con el tamaño "Normal", **When** el visitante pulsa el control para aumentar el texto, **Then** el tamaño pasa a "Grande" (+15 % respecto a "Normal"), el control muestra con palabras el nivel elegido y el texto, los botones y las zonas pulsables se adaptan en toda la interfaz.
2. **Given** que el texto está en "Grande", **When** pulsa de nuevo para aumentar, **Then** pasa a "Muy grande" (+30 % respecto a "Normal"); si pulsa para reducir, **Then** vuelve a "Grande" y después a "Normal", sin tamaños intermedios no explicados.
3. **Given** que eligió "Grande" o "Muy grande", **When** abre la web en otra visita, **Then** ve directamente el tamaño elegido sin que aparezca antes el tamaño "Normal".
4. **Given** que usa un móvil pequeño con el texto en "Muy grande", **When** recorre la carta, la cesta y el contacto, **Then** no hay desplazamiento horizontal ni texto solapado y los botones siguen siendo cómodos de pulsar.
5. **Given** que el visitante usa además el zoom del navegador o el tamaño de texto del dispositivo, **When** amplía el texto desde la web, **Then** todas las secciones siguen siendo legibles y los controles de apariencia siguen siendo accesibles.

---

### User Story 3 - Encontrar y usar los controles con confianza (Priority: P2)

Como persona poco habituada a la tecnología, quiero que los controles de tema y tamaño sean evidentes, estén siempre a mano y se puedan usar con teclado sin perder mi pedido.

**Why this priority**: Un control que no se encuentra o no se entiende no sirve, y nadie debe temer perder su pedido al cambiar la apariencia.

**Independent Test**: Se puede comprobar con la cesta llena: localizar los controles desde cualquier sección, usarlos solo con teclado y verificar que el pedido sigue intacto.

**Acceptance Scenarios**:

1. **Given** que el visitante abre la web por primera vez, **When** busca cómo cambiar el aspecto, **Then** encuentra en la cabecera, siempre visibles junto a la navegación, un control con palabras claras para el tema y otro para el tamaño del texto, no solo iconos.
2. **Given** que usa únicamente el teclado, **When** recorre los controles de tema y tamaño, **Then** ve dónde está el foco, puede activarlos con el teclado y percibe qué opción está seleccionada.
3. **Given** que tiene productos en la cesta de demostración, **When** cambia el tema o el tamaño del texto, **Then** las líneas, las cantidades y el total siguen siendo exactamente los mismos.
4. **Given** que ha elegido cualquier combinación de tema y tamaño, **When** recorre toda la interfaz, **Then** todos los textos, precios, avisos y botones mantienen contraste suficiente y ningún control queda invisible o ilegible.
5. **Given** que el navegador no permite recordar preferencias, **When** cambia el tema o el tamaño, **Then** los controles funcionan durante esa visita sin mostrar errores al visitante.

### Edge Cases

- El visitante nunca ha elegido nada y el sistema tampoco expresa preferencia: se muestra el aspecto claro y el tamaño "Normal".
- La preferencia del sistema cambia mientras la página está abierta: se sigue solo si no hay elección manual; una elección manual anterior sigue vigente hasta elegir "Seguir el sistema".
- Hay una elección manual guardada de una visita anterior y el sistema cambió después: prevalece la elección manual.
- En modo oscuro, ningún texto, precio, aviso, botón ni elemento de la barra móvil del pedido queda sobre un fondo que dificulte la lectura; en modo claro ocurre lo mismo.
- Con el texto en "Muy grande" (+30 %) en una pantalla de 360 px de ancho, la carta, la cesta, el contacto y la cabecera no se solapan ni obligan a desplazarse horizontalmente; la cabecera mantiene su altura inicial y los botones conservan un área pulsable de al menos 44 px.
- El visitante combina la ampliación de texto de la web con el zoom del dispositivo: la página sigue siendo utilizable.
- El navegador impide guardar la elección: los controles siguen funcionando en la visita actual y no se muestran mensajes de error.
- Los cambios de apariencia no modifican la carta verificada, no vacían la cesta, no crean pedidos reales, no cobran nada ni solicitan datos personales.
- El cambio de tema no produce parpadeos ni animaciones llamativas que distraigan o desorienten.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La web MUST ofrecer tres opciones de tema identificadas con palabras: "Seguir el sistema", "Claro" y "Oscuro".
- **FR-002**: Si no existe una elección manual de tema, la web MUST aplicar la preferencia del sistema; si el sistema no expresa preferencia, MUST aplicar el aspecto claro actual.
- **FR-003**: Si existe una elección manual de tema, la web MUST aplicarla en lugar de la preferencia del sistema, también en visitas posteriores.
- **FR-004**: Cuando cambie la preferencia del sistema con la página abierta, la web MUST adaptarse automáticamente siempre que no haya una elección manual activa.
- **FR-005**: La opción "Seguir el sistema" MUST dejar sin efecto la elección manual y recuperar la preferencia del sistema, conservando esa decisión en visitas posteriores.
- **FR-006**: La web MUST mostrar el tema y el tamaño de texto correctos desde el primer momento en que la página resulta visible, sin mostrar brevemente un tema ni un tamaño equivocados.
- **FR-007**: La web MUST ofrecer un control visible con etiquetas escritas para cambiar el tamaño del texto entre tres niveles: "Normal" (el tamaño actual), "Grande" (+15 %) y "Muy grande" (+30 %).
- **FR-008**: El cambio de tamaño MUST aplicarse a textos, botones y zonas pulsables de toda la interfaz —incluidos avisos del pedido y barra móvil "Ver tu pedido"—, manteniendo la carta legible, las zonas pulsables de al menos 44 px y los controles utilizables en pantallas pequeñas sin aumentar la altura de la cabecera.
- **FR-009**: La web MUST recordar por separado la elección de tema y la de tamaño de texto, y aplicarlas en la siguiente visita en el mismo navegador o dispositivo.
- **FR-010**: Los controles de apariencia MUST estar en la cabecera, visibles de forma constante en todas las secciones, con nombres comprensibles, foco visible, funcionamiento con teclado y un estado seleccionado perceptible también por tecnología de asistencia; en pantallas pequeñas MUST compactarse sin aumentar la altura de la cabecera.
- **FR-011**: En el tema claro y en el oscuro, todos los textos, precios, avisos, botones y elementos de la barra móvil del pedido MUST alcanzar contraste suficiente: al menos 4,5:1 para texto normal y 3:1 para texto grande y bordes de controles, según WCAG AA.
- **FR-012**: Cambiar el tema o el tamaño del texto MUST NOT vaciar ni alterar la cesta de demostración, sus cantidades ni su total, y MUST NOT crear pedidos, pagos ni registros de cliente.
- **FR-013**: La web MUST NOT pedir datos personales ni enviar las preferencias a servicios externos; el recuerdo de la elección MUST limitarse al navegador o dispositivo del visitante.
- **FR-014**: La web MUST seguir siendo un sitio estático en español, sin pantalla de gestión, sin carta de bebidas y sin extras opcionales de producto.
- **FR-015**: Si el navegador impide guardar las preferencias, la web MUST permitir cambiar tema y tamaño durante la visita sin mostrar errores al visitante.

### Key Entities

- **Preferencia de tema**: Elección del visitante entre "Seguir el sistema", "Claro" y "Oscuro". Se recuerda entre visitas; mientras sea "Seguir el sistema", depende de la preferencia del dispositivo en cada momento.
- **Preferencia de tamaño de texto**: Nivel elegido entre "Normal", "Grande" y "Muy grande". Se recuerda por separado de la preferencia de tema.
- **Preferencia del sistema**: Indicación que el dispositivo hace sobre tema claro u oscuro. Se consulta al abrir la página y puede cambiar mientras la página está abierta.
- **Cesta de demostración**: Selección temporal de productos y cantidades con su total. Los cambios de apariencia no la modifican.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba con cinco personas que no conocen la web, al menos cuatro encuentran y cambian el tema a oscuro, y aumentan el texto, en menos de 20 segundos sin ayuda.
- **SC-002**: En la misma prueba, al menos cuatro de cinco personas valoran los controles como "fáciles de encontrar y entender" con 4 o 5 sobre 5.
- **SC-003**: En cinco cargas con cada preferencia del sistema (clara y oscura) y con cada elección manual, el tema y el tamaño correctos aparecen en el primer momento visible: cero apariciones del tema o del tamaño equivocados.
- **SC-004**: En cinco pruebas consecutivas, las elecciones de tema y de tamaño se conservan al cerrar y volver a abrir la web en el mismo navegador: 5 de 5.
- **SC-005**: En ambos temas y en los tres tamaños de texto, el 100 % de los textos, botones, avisos y elementos de la barra móvil cumple los umbrales de contraste AA (4,5:1 en texto normal; 3:1 en texto grande y bordes de controles).
- **SC-006**: Con el texto en "Muy grande" (+30 %) en un móvil de 360 px de ancho, cero desplazamientos horizontales y cero solapes en carta, cesta, contacto y cabecera; la cabecera conserva su altura inicial y todos los botones mantienen un área pulsable de al menos 44 px.
- **SC-007**: Si cambia la preferencia del sistema con la página abierta y no hay elección manual, el aspecto se adapta en menos de un segundo sin recargar la página.
- **SC-008**: Ningún cambio de apariencia produce una petición a un servicio externo, un pedido real, un pago ni una solicitud de datos personales: 0 de 0.
- **SC-009**: Con productos en la cesta, cambiar tema y tamaño conserva las mismas líneas, cantidades y total en 5 de 5 pruebas.

## Assumptions

- La web existente es estática, está en español y no tiene cuentas ni backend; la nueva funcionalidad se añade sin modificar la carta verificada ni el flujo de pedido de demostración.
- El dispositivo del visitante puede indicar una preferencia de tema; si no lo hace, se entiende que prefiere el aspecto claro actual.
- "Recordar" significa que la elección persiste en el mismo navegador y dispositivo: no se sincroniza entre dispositivos ni se asocia a una persona.
- Los controles se muestran a todas las personas que visitan la web, sin exigir registro ni datos personales.
- El público incluye personas con poca experiencia tecnológica, por lo que las opciones se nombran con palabras cotidianas y no con términos técnicos.
- Esta funcionalidad no cambia productos, precios, teléfono ni dirección, y no añade la carta de bebidas ni extras de producto.
- Según `CONTRIBUTING.md`, el trabajo se realiza en la rama `issue/apariencia-accesible`, creada desde `origin/dev`.
