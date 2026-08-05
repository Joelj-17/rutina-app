# Rutina

App personal de entrenamiento: cronómetro, control de series, descansos
automáticos, esquemas de cada ejercicio y registro corporal.

Funciona sin conexión y se instala en el móvil como aplicación.

## Estructura

```
publico/    Lo que Netlify publica en internet
personal/   NO se publica ni se sube al repositorio (ver .gitignore)
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

Netlify publica la carpeta `publico` (configurado en `netlify.toml`).
Cada `git push` a `main` despliega automáticamente.

> Este repositorio es **independiente** del de la web de Praxioma.
> No mezclar.
