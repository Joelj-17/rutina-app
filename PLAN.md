# Plan del producto

> Recogido el 6 de agosto de 2026. Es la visión del proyecto, no lo que hay
> construido. Lo construido está en `README.md`.

## La idea

Una plataforma para llevar el control de la vida física: entrenamiento,
comida, movimiento y descanso, en un solo sitio y sin complicaciones.

**Principio de partida:** los datos son del usuario y viven en su móvil.
La plataforma solo pone la herramienta.

## Estructura: nodos de actividad

La app no es «una rutina». Es un tronco con **nodos de actividad**, y cada
uno aporta al mismo balance de calorías y al mismo historial.

```
INICIO — el diario de hoy
├── ACTIVIDAD
│   ├── Gimnasio        ← lo primero, es lo que hace falta ya
│   ├── Correr / andar
│   └── Otros deportes  (fútbol, básquet, lo que sea)
├── COMIDA
├── CUERPO
└── DIARIO — historial unificado
```

**Modularidad obligatoria.** Alguien que solo quiera contar comidas tiene que
poder usar solo eso. No se puede perder a un usuario por obligarle a rellenar
lo que no le interesa.

## Gimnasio: cómo debe funcionar

**Rutinas guardadas.** El usuario crea las suyas y les pone nombre
(«entrenamiento brazos», «pierna»). Se guardan y se reutilizan.

**Calendario.** Puede dejarlas programadas por días, para quien lleve un plan
estricto. Y puede añadir un día de gimnasio no programado.

**Dos formas de registrar una sesión**, y las dos hacen falta:

1. **Guiada** — navegando por los ejercicios con cronómetro y descansos, como
   está ahora. Guarda tiempos, pesos, valoración y lo que se haya cambiado.
2. **Rápida** — marcar la rutina como hecha, indicando si fue *exactamente lo
   guardado*, *más* o *menos* (más repeticiones, se saltó algo, etc.).

**Catálogo de ejercicios.** Con nombres alternativos, enlaces de búsqueda en
YouTube y esquemas dibujados.

## Movimiento y otros datos

Vincular apps de pasos donde se pueda, y **siempre** permitir meter el dato a
mano. Nunca depender de una integración para poder usar la app.

## Modelo de negocio

| | |
|---|---|
| **Gratis** | Un anuncio al entrar, con el aviso de que es por ser gratuito |
| **Sin anuncios** | 1 € pago único |
| **Premium** | 5 €/mes |

**Qué da el Premium:** análisis de la semana completa —entrenamientos, carrera,
pasos, comida y sueño— con recomendaciones según el plan de cada uno. Y
consultas libres: ejercicios, sugerencias, alimentación, rutas para correr.

**Datos del Premium:** el usuario cede ciertos datos para el análisis. **En
ningún caso identidad ni documento identificativo.**

---

# Decisiones tomadas (6 de agosto de 2026)

1. **Estructura de nodos y modularidad:** aprobada.
2. **Anuncios: sí.** El proyecto tiene que dar dinero. El mensaje es
   **«no vendemos ni cedemos tus datos personales; los anuncios son lo que
   mantiene la versión gratuita»**. Cuidado con el matiz: no se puede seguir
   diciendo «tus datos no salen del móvil» a secas, porque el SDK de anuncios
   sí ve el dispositivo. Lo que sí es cierto y defendible: *tus registros
   —entrenamientos, comida, peso— no salen de tu móvil*.
3. **Premium con IA: sí.** Aviso claro y consentimiento explícito de
   tratamiento en el momento de contratarlo, no escondido en las condiciones.
4. **Empaquetado nativo: sí**, para poder leer los pasos.

**Forma jurídica: autónomo.** Pendiente de revisar antes de publicar en las
tiendas: como autónomo la responsabilidad es personal e ilimitada, y aquí hay
datos de salud de terceros, suscripciones y publicidad. Merece una
conversación específica (enlaza con las notas de responsabilidad civil de
Praxioma) antes del lanzamiento, no antes de seguir construyendo.

---

# Detalle de esas decisiones

## 1. El catálogo de ejercicios: cuántos con dibujo

Los esquemas actuales están dibujados a mano, pose a pose. Cientos de
ejercicios con dibujo no es realista.

**Propuesta:** un catálogo amplio de nombres y enlaces (sin límite práctico),
y **80-120 ejercicios con esquema**, elegidos por cubrir todos los patrones de
movimiento y el material habitual. El resto entra con nombre, músculo y enlace
a vídeos, y se les va añadiendo dibujo con el tiempo.

## 2. Anuncios contra privacidad — hay tensión real

«Tus datos no salen de tu móvil» y «AdMob» no encajan del todo: las redes de
anuncios recogen identificadores del dispositivo y en la UE obligan a una
plataforma de consentimiento.

**Hay que elegir**, y las dos son defendibles:

- **Privacidad como argumento de venta** — sin anuncios, monetizar solo con el
  euro y el Premium. Más coherente, ingresos más lentos.
- **Anuncio al entrar** — asumiendo el aviso de consentimiento y matizando la
  promesa: *tus registros* no salen del móvil, aunque el anuncio sí vea el
  dispositivo.

## 3. El Premium obliga a servidor

Analizar la semana con IA implica que esos datos salgan del dispositivo.
Se puede hacer bien: enviar solo lo necesario, sin nombre ni identificadores,
con consentimiento explícito y acuerdo de tratamiento con el proveedor.
Pero deja de ser «todo en tu móvil» para quien contrate el Premium, y hay que
decirlo con claridad en el propio flujo de alta.

## 4. Los pasos exigen app nativa

Una web, aunque esté instalada, no puede leer Salud de Android ni Apple Health.
Eso llega con el empaquetado nativo (Capacitor). Hasta entonces: a mano.

---

# Cosas ya arregladas (6 de agosto de 2026)

**Un dispositivo vacío ya no puede pisar la copia buena.** Pasó dos veces ese
día. La causa real no era la lógica de subida: el **service worker cacheaba
`/api/sync`**, así que el móvil leía una nube vacía que ya no existía, y a
partir de ahí subía su vacío encima. Ahora el service worker se aparta de
`/api/` por completo, cada consulta lleva marca distinta, y la protección vive
dentro de `subirDatos()`, que es el único punto donde se escribe en la nube.

**El PIN dura media hora.** Se pedía en cada recarga y eso lo convertía en un
peaje. La sesión abierta vive en `sessionStorage` —se borra al cerrar la app,
así que la frase no queda escrita de un día para otro— y caduca a los 30
minutos sin tocar nada, contando desde la última interacción. Desconectar la
borra. Salió de usarlo él: *«tendría que ser sesión que perdure ciertos
minutos sin cerrarse»*.

**Copias de seguridad locales.** Se guarda copia antes de cada operación que
pueda machacar datos —traer de la nube, importar, restaurar— y una al día. Van
en su propia clave del almacén y **la sincronización no las toca nunca**, que
es todo el propósito. Se restauran desde CUERPO, y restaurar también hace
copia de lo que había. Esto es lo que convierte «confía en que no la vuelvo a
liar» en «da igual, se recupera».

**Un dato que falte ya no tumba una pantalla.** Una comida sin el campo de
proteína reventaba COMIDA entera. Ahora los números que llegan mal se tratan
como cero en vez de propagar el fallo.

# Por dónde empezar

1. ~~**Rediseño visual y de organización**~~ ← **primera pasada hecha** el 6 de
   agosto de 2026. Lo que pidió y lo que se ha hecho:
   - *«me satura ver el entrenamiento lo primero»* → la portada ya no lleva el
     entrenamiento delante. Primero un **mapa** con las cuatro secciones y su
     estado; la acción del día va después, y **desaparece si no hay nada que
     hacer**.
   - *«no veo qué modos u opciones hay»* → el mapa dice qué hay y cómo va cada
     cosa sin entrar a mirar.
   - *«no hay menú y es poco intuitivo»* → **menú fijo abajo**, siempre a la
     vista, también en la portada. Fuera la barra de pestañas de arriba y el
     botón de «volver»: ya no hay a dónde volver.
   - El **cronómetro solo aparece cuando hace falta** (sesión en marcha o
     pantalla de entrenamiento). Era la mitad de la sensación de agobio.

   **Segunda pasada, 8 de agosto de 2026:** la pantalla de entrenamiento ya no
   es una lista larga — se ve **una tarjeta a la vez**, con tira de puntos para
   saltar a cualquiera, botones de anterior y siguiente, y la sesión entera
   plegada al final. Al acabar cada ejercicio se apuntan además repeticiones
   reales, zona de molestia y observaciones escritas.

   Queda para más adelante: las secciones de correr y otros deportes no
   existen todavía.

1b. ~~**Ajustes por ejercicio y progresión de carga**~~ ← **HECHO el 9 de
   agosto de 2026** (versión 40): overlay `S.ajustes` editable desde la
   tarjeta, regla de las dos sesiones fáciles con propuesta que se recuerda,
   etiquetas Fácil/Bien/Duro, y además el modelo de rutina «Corte agosto»
   seleccionable. Detalle en el commit de la v40.

1b-bis (texto original). **Ajustes por ejercicio y progresión de carga** (pedido el 8 de agosto de
   2026). Es el puente hasta el paso 2: se monta **encima** de la rutina fija
   de hoy, sin esperar al modelo de datos.

   **Lo que YA está hecho y no hay que rehacer.** La valoración por ejercicio
   existe desde el rediseño del 8 de agosto: al terminar cada uno se marca con
   un toque **Me sobraba / Justo / Casi al límite** (`VALORES`, guardado en
   `S.marcas[id].esf`), y viaja con la sesión al histórico, a la exportación y
   a la fusión entre dispositivos. Junto a eso ya se apuntan las
   **repeticiones reales de cada serie** (`m.reps`), la **zona** donde ha
   molestado (`m.zonas` + `m.zonaOtra`, con las articulaciones plausibles de
   cada ejercicio) y las **observaciones escritas** (`m.nota`). Y hay un aviso
   de «la última vez» que lo lee todo y ya dice *«te sobraba → prueba a subir
   1 kg»* (`ultimaMarca`).

   **Lo que falta de verdad:**
   - **La regla de las dos seguidas.** Hoy el aviso mira **una sola** sesión
     anterior. Hay que mirar las dos últimas en las que se hizo ese ejercicio:
     dos «me sobraba» seguidas → proponer subir; «casi al límite» o molestia →
     mantener o bajar. Y que la propuesta **se recuerde**, no que sea un texto
     que aparece y se va.
   - **Que el peso objetivo se pueda cambiar y se quede cambiado.** Hoy
     `S.pesos[id+"|"+fase]` guarda lo que usaste, pero el objetivo sale de la
     tabla `f:[[series, reps, peso], …]` escrita en el código.
   - **Overlay de ajustes**, la pieza nueva: un `S.ajustes[id]` con
     `{series, reps, peso}` que **pisa** al catálogo cuando existe. `plan(id)`
     lo consulta primero y cae a la tabla fija si no hay nada. Así se editan
     peso y series×reps desde la app sin tocar código, y el día que llegue el
     paso 2 el overlay se convierte en el dato de verdad de la rutina en vez
     de tirarse.
   - Editable desde la propia tarjeta del ejercicio, que es donde estás cuando
     te das cuenta de que el peso se queda corto.

   **Por qué hace falta:** viene del waterpolo. En pierna va sobrado y en otros
   ejercicios va justo, así que un peso «de tabla» igual para todo no le sirve.

   **Ojo con la sincronización:** `S.ajustes` es estado del usuario, así que
   necesita su ruta en `S.ts` para que la fusión sepa qué lado es más reciente,
   y hay que decidir si es por fase o común a todas.

1c. **Plantillas de compra configurables** (pedido el 8 de agosto de 2026).
   La lista de la compra ya existe (sección «La compra» en Comida, desde la
   versión 30): elementos con casilla para marcar en el súper, añadir y quitar
   a mano, «Quitar lo comprado» para dejarla lista para la semana siguiente, y
   sincronizada con `fundirLista` + lápidas como una comida.

   **Lo que está fijo y de momento vale así** (él lo dijo tal cual: *«por
   ahora la compra será fija»*): el botón «Poner la compra del plan» rellena
   `COMPRA_PLAN`, su lista cerrada del Consum escrita en el código.

   **Para el producto:** cada usuario debe poder guardarse SUS plantillas
   («compra semanal», «pescadería», la que sea), con nombre, y rellenar la
   lista activa desde una de ellas de un toque. Es el mismo movimiento que
   catálogo→rutinas del paso 2: lo escrito en el código pasa a ser un dato del
   usuario. Cuando llegue, `COMPRA_PLAN` se convierte en la plantilla inicial
   de Joel y desaparece del código. Sincronización: las plantillas son estado
   del usuario → necesitan id + ts y sus rutas en la fusión, igual que la
   lista activa que ya lo tiene.

2. **Modelo de datos**: separar catálogo de ejercicios, rutinas y sesiones
   (hoy están fundidos en el código)
3. **Crear y guardar rutinas propias**
4. **Calendario y las dos formas de registrar**
5. **Catálogo ampliado de ejercicios**
6. Nodos de correr y otros deportes
7. Empaquetado nativo, anuncios y Premium

## Nota sobre el estado actual

Lo que hay construido funciona pero está **hecho a medida de una persona**: la
rutina, los ejercicios y las fases están escritos en el código. El paso 2 es
el que convierte esto en un producto, y conviene darlo antes de añadir más
funciones encima.
