# Rutina

App personal de entrenamiento: cronómetro, control de series, descansos
automáticos, esquemas de cada ejercicio y registro corporal.

Funciona sin conexión y se instala en el móvil como aplicación.

## Estructura

```
publico/       Lo que se publica en internet
functions/     El punto de sincronización (una función de Cloudflare)
personal/      NO se publica ni se sube al repositorio (ver .gitignore)
```

**En `publico/` no puede haber nada personal.** Todo lo que esté ahí es
accesible por cualquiera que conozca la dirección del sitio.

## Los datos

La app no tiene servidor ni cuentas. Todo lo que el usuario guarda —perfil,
peso, cintura, historial y pesos de cada ejercicio— vive únicamente en el
`localStorage` de su navegador.

Quien abra la dirección sin ser el usuario ve una app vacía.

Para mover los datos entre dispositivos: pestaña **CUERPO** → *Copiar datos*
o *Exportar a archivo*, y luego *Importar* en el otro.

## Desarrollo

Un solo archivo, sin dependencias ni compilación: `publico/index.html`.

Para probarlo en local con service worker (requiere http, no vale `file://`):

```bash
cd publico
python -m http.server 8000
```

## Despliegue

**Cloudflare Pages**, proyecto `rutina-app` → https://rutina-app.pages.dev
Cada `git push` a `main` despliega automáticamente.

Configuración: sin orden de compilación, carpeta publicada `publico`.
No hay `package.json` **a propósito**: sin dependencias no hay instalación,
y el despliegue es solo copiar archivos.

La función de `functions/api/sync.js` responde en `/api/sync` y guarda en un
espacio de Workers KV enlazado con el nombre **`RUTINA`** (ajustes del
proyecto → *Bindings*). Sin ese enlace la sincronización devuelve un error
claro, pero la app sigue funcionando en local.

> Este repositorio es **independiente** del de la web de Praxioma.
> No mezclar.
