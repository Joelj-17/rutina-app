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

# Cosas concretas que hay que arreglar

**Un dispositivo recién estrenado sube su vacío encima de todo.** Pasó el 6 de
agosto de 2026: abrió la app en la dirección nueva desde el móvil, entró con
la frase, y como en ese teléfono no había nada todavía, la subida automática
mandó un estado vacío a la nube y tapó lo que había. Hubo que rescatar los
datos de los archivos internos del navegador del PC.

Existe la comprobación `nubeMasPobre`, pero solo protege al **bajar**. Falta
la simétrica: **no subir automáticamente cuando lo local está vacío y en la
nube hay algo**. Que en ese caso pregunte, o directamente que solo baje. La
subida automática solo debería dispararse tras un cambio real del usuario.


**El PIN se pide en cada recarga.** Hoy la sesión muere al recargar la página,
y eso convierte el PIN en un peaje constante en vez de una protección. Debe
durar un rato —del orden de 15-30 minutos de inactividad— y solo entonces
volver a pedirlo. Sale de usarlo él: *«al recargar la página se tiene que
poner el PIN; tendría que ser sesión que perdure ciertos minutos»*
(6 de agosto de 2026).

Al hacerlo, cuidado con dónde se guarda esa sesión: en memoria se pierde al
recargar (que es justo el problema), así que hay que guardarla con su hora de
caducidad y comprobarla al abrir. Y que un cierre de sesión explícito la borre
de verdad.

# Por dónde empezar

1. **Rediseño visual y de organización** ← lo primero que pidió
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
