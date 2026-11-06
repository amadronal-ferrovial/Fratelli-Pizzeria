# Cómo contribuir

Cada ejercicio es un issue. Las reglas son las mismas para personas y para agentes de IA.

## Reglas

1. **No se hace push directo a `main` ni a `dev`.** Está bloqueado.
2. Trabaja siempre en una rama `issue/<nombre-del-issue>`, creada desde `dev`. Solo se permiten ramas con ese prefijo, en minúsculas, números y `-`, `.`, `_` (ejemplo: `issue/cesta-persistente`).
3. Haz commits y push libremente a tu rama.
4. Abre un Pull Request **contra `dev`**. Debe pasar el CI (`pr-rules` y `test`) y tener 1 aprobación.
5. Solo la persona responsable de la clase fusiona `dev` en `main`.

## Paso a paso

```sh
git fetch origin
git switch -c issue/cesta-persistente origin/dev
# ... trabaja con Spec Kit, haz commits ...
git push -u origin issue/cesta-persistente
gh pr create --base dev --fill
```

## Para agentes de IA

- Crea la rama `issue/<nombre-del-issue>` desde `origin/dev` antes de modificar nada.
- Nunca hagas push a `main` o `dev`, ni fuerces el push (`--force`).
- Usa el token o la sesión de `gh` de la persona que te dirige; no crees cuentas ni claves nuevas.
- Termina abriendo un PR contra `dev` que enlace el issue (`Closes #N`) tras ejecutar `npm test`.
