# Feature Specification: Web de Pizzería Fratelli

**Feature Branch**: `001-pizzeria-web`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Crear una web sencilla y profesional para Pizzería Fratelli que muestre productos, banner, teléfonos y ubicación, con un flujo de pedido simulado que termine en un aviso de éxito y no cree pedidos reales. Usar como referencia la carta enlazada."

## Clarifications

### Session 2026-11-06

- Q: ¿La primera versión debe incluir solo la carta de comida seleccionada en el enlace o también la carta de bebidas del restaurante? → A: Incluir solo la carta de comida seleccionada en el enlace.
- Q: ¿Cómo debe gestionar la web las opciones de tamaño o formato que tienen algunos productos? → A: Permitir elegir entre formatos con precios distintos, sin extras opcionales.
- Q: ¿El personal necesita una pantalla dentro de la web para actualizar productos y precios, o basta con que la carta se actualice fuera de la web? → A: Sin pantalla de gestión; actualizar la carta mediante un proceso sencillo fuera de la web.
- Q: Tras mostrar el éxito del pedido de demostración, ¿debe vaciarse la cesta o permanecer visible? → A: Vaciar la cesta después de mostrar el éxito.
- Q: ¿En cuánto tiempo debería poder usarse la página desde que se abre en un PC de gama media o baja? → A: En menos de 3 segundos.

## User Scenarios & Testing

### User Story 1 - Explorar la pizzería y su carta (Priority: P1)

Como cliente, quiero conocer la pizzería y explorar sus productos para decidir qué pedir.

**Why this priority**: Mostrar claramente la oferta del restaurante es el principal valor de la web.

**Independent Test**: Se puede comprobar sin realizar un pedido: abrir la web, recorrer las categorías y consultar los detalles de varios productos.

**Acceptance Scenarios**:

1. **Given** que un cliente abre la web, **When** consulta la carta, **Then** puede recorrer las categorías y ver el nombre y precio de los productos disponibles.
2. **Given** que un producto tiene descripción, formato o imagen en la fuente verificada, **When** el cliente abre su ficha, **Then** ve esos datos; si no tiene imagen, el producto sigue siendo comprensible y no aparece una imagen rota.
3. **Given** que el cliente visita la web desde una pantalla pequeña o un PC, **When** navega por la carta, **Then** el contenido permanece legible y las acciones principales son utilizables.
4. **Given** que un cliente o empleado abre la web pública, **When** consulta la carta, **Then** solo encuentra la carta de comida y no una pantalla para gestionar productos.

### User Story 2 - Preparar un pedido de demostración (Priority: P2)

Como cliente, quiero seleccionar productos, revisar el importe y probar el flujo de pedido para entender cómo sería pedir en la pizzería.

**Why this priority**: La interacción de pedido hace que la web sea funcional, aunque no se procesen compras reales.

**Independent Test**: Añadir productos a la cesta, cambiar cantidades, revisar el total e intentar confirmar un pedido de prueba.

**Acceptance Scenarios**:

1. **Given** que el cliente está viendo un producto disponible, **When** lo añade a la cesta y cambia su cantidad, **Then** la cesta muestra los productos y cantidades seleccionados y el importe se actualiza correctamente.
2. **Given** que la cesta contiene uno o más productos, **When** el cliente confirma el pedido de prueba, **Then** ve una notificación de éxito que indica que el pedido es una demostración, no se ha enviado al restaurante y la cesta queda vacía.
3. **Given** que la cesta está vacía, **When** el cliente intenta confirmarla, **Then** no se muestra una confirmación de éxito y se le indica que añada productos.
4. **Given** que el cliente elimina un producto de la cesta, **When** vuelve a revisar el pedido, **Then** el producto ya no aparece y el total refleja el cambio.
5. **Given** que un producto ofrece varios formatos con precios distintos, **When** el cliente lo añade a la cesta, **Then** debe elegir un formato, la cesta conserva esa elección y su precio, y no se ofrecen extras opcionales.

### User Story 3 - Encontrar cómo contactar y llegar al restaurante (Priority: P2)

Como cliente, quiero encontrar el teléfono y la dirección del restaurante para poder llamar o localizarlo.

**Why this priority**: La web debe facilitar una visita o una consulta directa, independientemente del pedido de demostración.

**Independent Test**: Abrir la sección de contacto, comprobar el número y la dirección, y activar las acciones de llamada y ubicación.

**Acceptance Scenarios**:

1. **Given** que el cliente consulta la información del restaurante, **When** abre la sección de contacto, **Then** ve el teléfono verificado y la dirección completa.
2. **Given** que el cliente quiere llamar o llegar al restaurante, **When** activa el teléfono o la ubicación, **Then** se inicia la acción correspondiente en su dispositivo o servicio de mapas.

### Edge Cases

- Si un producto carece de descripción o imagen en la fuente, se muestran los datos disponibles sin inventar información ni dejar espacios rotos.
- Si un producto deja de estar disponible, no puede añadirse a un pedido de demostración.
- Si un producto ofrece varios formatos con precios distintos, no puede añadirse sin elegir uno.
- Si la cantidad de un producto se reduce o se elimina, el total se recalcula y nunca queda desactualizado.
- Si no hay productos en la cesta, la confirmación no simula un pedido completado.
- Si la dirección, el teléfono o algún dato de la carta no puede verificarse antes de publicar, no se sustituye por datos inventados.
- Si una acción externa de llamada o mapas no está disponible en el dispositivo, la información de contacto sigue visible para poder copiarla o consultarla.

## Requirements

### Functional Requirements

- **FR-001**: La web MUST presentar Pizzería Fratelli con una identidad visual coherente, un banner destacado y una navegación clara hacia la carta y el contacto.
- **FR-002**: La carta MUST organizar los productos por categorías y mostrar, cuando estén disponibles, su nombre, descripción, formatos y sus precios correspondientes.
- **FR-003**: Los nombres, precios, descripciones, formatos y disponibilidad MUST corresponder a una versión verificada de la carta de comida enlazada; la web MUST NOT inventar datos ausentes.
- **FR-004**: La web MUST presentar una imagen de producto solo cuando exista una imagen utilizable en la fuente; la falta de imagen MUST NOT impedir consultar el producto.
- **FR-005**: La información de contacto MUST incluir el teléfono público verificado (+34 918 28 50 61) y la dirección (Calle Quero, 83-85, 28024 Madrid, España), con acciones para iniciar una llamada y consultar la ubicación.
- **FR-006**: El cliente MUST poder añadir productos disponibles a una cesta, elegir un formato cuando un producto tenga opciones de precio, cambiar cantidades y eliminar productos.
- **FR-007**: La cesta MUST mostrar un resumen de los productos y formatos seleccionados y calcular correctamente el importe según sus precios y cantidades.
- **FR-008**: El cliente MUST poder confirmar un pedido de demostración solo cuando la cesta no esté vacía.
- **FR-009**: Al confirmar un pedido de demostración, la web MUST mostrar una notificación visible de éxito, aclarar que no se ha enviado un pedido real y vaciar la cesta.
- **FR-010**: La web MUST NOT procesar pagos, transmitir pedidos al restaurante ni solicitar datos personales para completar la demostración.
- **FR-011**: La web MUST estar en español y permitir recorrer la información, la carta y la cesta con controles comprensibles y utilizables en pantallas pequeñas y grandes.
- **FR-012**: La carta de la primera versión MUST incluir únicamente la carta de comida seleccionada en el enlace; la carta de bebidas queda fuera de alcance.
- **FR-013**: La web MUST NOT ofrecer extras opcionales ni modificaciones de productos; cuando un producto tenga varios formatos con distinto precio, el formato será la única opción de personalización.
- **FR-014**: La web MUST NOT incluir una pantalla de gestión de productos en esta primera versión; los cambios de carta se realizarán mediante un proceso sencillo fuera de la experiencia pública para clientes.

### Key Entities

- **Restaurante**: Nombre, banner, teléfono, dirección y ubicación del establecimiento.
- **Producto**: Categoría, nombre, descripción, precio, formato, disponibilidad e imagen opcional.
- **Cesta**: Selección temporal de productos, formato elegido cuando corresponda y cantidades, con su importe calculado.
- **Pedido de demostración**: Resumen temporal de una cesta confirmado únicamente para mostrar el resultado de éxito; no representa ni crea un pedido real.

## Success Criteria

### Measurable Outcomes

- **SC-001**: En una prueba con cinco personas que no hayan usado la web, al menos cuatro pueden encontrar un producto y completar el pedido de demostración en menos de dos minutos sin ayuda.
- **SC-002**: En la misma prueba, al menos cuatro de cinco personas encuentran el teléfono y la dirección en menos de 20 segundos.
- **SC-003**: Todos los productos publicados en la carta coinciden con la versión verificada de la fuente en nombre, precio y formato; las descripciones solo se muestran cuando están disponibles.
- **SC-004**: Al menos cuatro de cinco personas valoran la claridad y coherencia visual de la web con 4 o 5 sobre 5.
- **SC-005**: Ningún flujo de pedido de demostración produce un pago, una transmisión al restaurante ni la apariencia de que se haya realizado una compra real.
- **SC-006**: En un PC de gama media o baja, el cliente puede empezar a consultar el contenido principal de la página en menos de 3 segundos desde que la abre.

## Assumptions

- La carta de comida seleccionada en el enlace de Tipsi es la referencia de productos para esta primera versión; actualmente presenta las categorías Entrantes, Nuestras Pastas, Pizzas Familiares, Postres Caseros y Pizzas Medianas. La carta de bebidas queda fuera de alcance.
- El enlace y las páginas públicas sirven como fuentes de referencia para preparar el contenido; no se requiere sincronización automática de carta ni integración de pedidos.
- El teléfono y la dirección se han tomado del perfil público de Tripadvisor; deben verificarse de nuevo antes de publicar porque pueden cambiar.
- Las imágenes son opcionales: se pueden usar las disponibles en la fuente de la carta; la web no necesita una foto real para cada producto.
- La experiencia se ofrece en español. No se requiere cuenta, pago, persistencia del pedido ni envío de información personal.
- El personal no necesita un panel integrado para gestionar la carta en esta versión; las actualizaciones se realizan fuera de la experiencia pública mediante un proceso sencillo.
- Fuentes consultadas:
  - [Carta de comida de Pizzería Fratelli en Tipsi](https://order.tipsipro.com/restaurants/95e4d962-dc79-427c-9e9d-6746276a7c9e?menu=72d151fb-b719-6539-aa66-6f5cbb617f88)
  - [Perfil público de Pizzería Fratelli en Tripadvisor](https://www.tripadvisor.es/Restaurant_Review-g187514-d10670751-Reviews-Pizzeria_Fratelli-Madrid.html)
