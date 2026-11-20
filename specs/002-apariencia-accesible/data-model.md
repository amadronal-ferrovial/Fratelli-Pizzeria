# Data Model: Apariencia accesible (modo oscuro y texto ampliable)

Toda la persistencia es local al navegador o dispositivo del visitante. No se crea cuenta, no se envía nada a un servicio y no se modifica el catálogo ni la cesta de demostración de la feature 001.

## Entities

### AppearancePreference (preferencia guardada)

| Field | Type | Storage key | Validation | Meaning |
|---|---|---|---|---|
| `themeChoice` | enum | `fratelli.appearance.theme` | `system` \| `light` \| `dark`; cualquier otro valor se sanea a `system` | Elección manual del visitante. `system` significa "seguir la preferencia del dispositivo" y también es una decisión explícita que se recuerda. |
| `textSize` | enum | `fratelli.appearance.textSize` | `normal` \| `large` \| `xlarge`; cualquier otro valor se sanea a `normal` | Nivel de texto elegido. Independiente de `themeChoice`. |

- Ambas claves se leen con `try/catch`. Si la clave no existe o no se puede leer, se usa el valor por defecto (`system`, `normal`).
- Ambas claves se escriben con `try/catch`. Si falla la escritura, el cambio se aplica igualmente en memoria durante la visita y no se muestra error.
- Guardar `system` o `normal` **no** equivale a "no elegir nada" a efectos de recuerdo: la decisión de seguir al sistema / tamaño inicial se conserva entre visitas.

### SystemPreference (preferencia del dispositivo)

| Field | Type | Source | Validation |
|---|---|---|---|
| `prefersDark` | boolean | `matchMedia('(prefers-color-scheme: dark)').matches` / media query CSS | Booleano; si el dispositivo no expresa preferencia, se trata como `false` (claro). |

- No se guarda: se consulta al cargar y puede cambiar mientras la página está abierta.
- Solo influye en el aspecto cuando `themeChoice === 'system'`.

### ResolvedAppearance (estado efectivo, derivado)

| Field | Type | Derivation | Persisted? |
|---|---|---|---|
| `resolvedTheme` | enum `light` \| `dark` | `themeChoice === 'system' ? (prefersDark ? 'dark' : 'light') : themeChoice` | No. Se recalcula en cada carga y en cada cambio del sistema. |
| `dataTheme` | enum `system` \| `light` \| `dark` | Igual que `themeChoice`, saneado | Sí, vía clave de tema; también se refleja en `<html data-theme>`. |
| `textSize` | enum `normal` \| `large` \| `xlarge` | Igual que la preferencia guardada | Sí; se refleja en `<html data-text-size>`. |
| `fontScale` | number | `normal → 1`, `large → 1.15`, `xlarge → 1.30` | No; se deriva en CSS desde `data-text-size`. |

El tema **resuelto** nunca se guarda. Si se guardara, un visitante que eligió "Seguir el sistema" se quedaría con un tema obsoleto cuando cambiara su dispositivo.

### TextScaleToken (tokens tipográficos)

| Token | Uso | Valor base |
|---|---|---|
| `--fs-body` | Cuerpo y párrafos | `1rem` |
| `--fs-small` | Notas, texto secundario | `0.85rem` |
| `--fs-h3` | Encabezados de sección/categoría | `1.15rem` |
| `--fs-h2` | Encabezados principales de sección | `clamp(1.6rem, 3.5vw, 2.25rem)` |
| `--fs-h1` | Título del restaurante | `clamp(2.25rem, 6vw, 4rem)` |
| `--fs-button` | Botones, selects y zonas pulsables | `0.95rem` |
| `--fs-nav` | Navegación y marca | `var(--fs-body)` |
| `--fs-price` | Precios y total | `1.25rem` |

Cada valor efectivo es `calc(token * fontScale)`. Los tokens de espaciado, `--header-height` y `min-height` de controles no se escalan; el mínimo táctil se fija con `max(2.75rem, 44px)`.

### ThemeToken (paleta semántica)

Los tokens de color se agrupan por tema claro/oscuro y se aplican desde `:root`, `:root[data-theme="dark"]` y `@media (prefers-color-scheme: dark) { :root[data-theme="system"] { … } }`. La lista completa y sus ratios verificados están en [research.md](research.md#paleta-y-verificación-de-contraste). Ningún componente define colores literales nuevos: todos consumen tokens, incluidos avisos, total de la cesta y barra móvil.

### CartInvariant (invariante de la cesta)

| Field | Regla |
|---|---|
| `cart.lines[]` | No se lee, reemplaza ni reordena desde los handlers de apariencia. |
| `cart.totalCents` | No se recalcula al cambiar tema o tamaño; lo renderiza `renderCart()` exactamente igual. |
| Demo confirmation | No se dispara desde los controles de apariencia. |

Los controles de apariencia solo escriben atributos en `<html>` y, como máximo, la meta `theme-color`. No importan ni llaman a `addItem`, `setQuantity`, `removeLine`, `confirmDemoOrder` ni a `fetch`.

## State Transitions

### Tema

```text
Sin clave guardada (= system, sin preferencia del sistema)
  └─ sistema Indica claro → claro; sistema indica oscuro → oscuro

system (guardado explícitamente)
  ├─ sistema cambia a oscuro → oscuro (en caliente, sin recarga)
  ├─ sistema cambia a claro  → claro  (en caliente, sin recarga)
  └─ eliges Claro / Oscuro   → light / dark (se guarda; el sistema deja de influir)

light (guardado)
  ├─ sistema cambia → sigue claro
  └─ eliges "Seguir el sistema" → system (se guarda; vuelve a depender del dispositivo)

dark (guardado)
  ├─ sistema cambia → sigue oscuro
  └─ eliges "Seguir el sistema" → system (se guarda; vuelve a depender del dispositivo)
```

### Tamaño de texto

```text
normal → large (+15 %) → xlarge (+30 %)
  ↑         │               │
  └─────────┴───────────────┘   (reducir siempre por un paso: xlarge → large → normal)
```

Cada transición escribe su clave, actualiza `data-text-size` y conserva la preferencia de tema. Cambiar el tamaño nunca cambia `themeChoice`, y viceversa.

### Almacenamiento no disponible

```text
 lectura/escritura lanza excepción
   → se captura
   → se mantiene el estado en memoria de la visita
   → los atributos y los controles siguen funcionando
   → no se muestra ningún aviso de error al visitante
```

## Validation Rules Summary

1. `normalizeTheme(value)` devuelve solo `system`, `light` u `dark`; `null`, cadena vacía, mayúsculas no reconocidas o valores inesperados → `system`.
2. `normalizeTextSize(value)` devuelve solo `normal`, `large` o `xlarge`; cualquier otro valor → `normal`.
3. `resolveTheme(themeChoice, prefersDark)` nunca devuelve `system`: devuelve `light` u `dark`.
4. `data-theme` y `data-text-size` en `<html>` siempre contienen valores ya saneados antes del primer pintado.
5. El estado de los `<select>` siempre coincide con los atributos del documento y con las claves guardadas cuando el almacenamiento está disponible.
6. Ninguna transición de apariencia altera `data/menu.json`, `cart.lines[]`, `cart.totalCents` ni genera peticiones de red.
