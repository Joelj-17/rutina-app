/* Guarda y devuelve un bloque cifrado. El servidor NUNCA ve nada legible:
   el cifrado y el descifrado ocurren en el navegador del usuario.

   Aquí solo llegan tres cosas: un identificador opaco, un montón de bytes
   ilegibles y una marca de tiempo. No hay cuentas, ni correos, ni nada
   que asocie ese bloque con una persona.

   El identificador se deriva de la frase de acceso con SHA-256, así que
   adivinarlo es tan difícil como adivinar la frase.

   Cloudflare Pages Function. Necesita un espacio de KV enlazado con el
   nombre RUTINA. Sin dependencias: el sitio se publica sin instalar nada. */

const CABECERAS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store"
};

const LIMITE = 2 * 1024 * 1024;          // 2 MB: de sobra para años de registro
const ID_VALIDO = /^[a-f0-9]{64}$/;      // exactamente un SHA-256 en hexadecimal

const responde = (obj, estado) =>
  new Response(JSON.stringify(obj), { status: estado || 200, headers: CABECERAS });

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CABECERAS });
  }

  if (!env.RUTINA) {
    return responde({ error: "falta el almacen: enlaza el espacio KV como RUTINA" }, 500);
  }

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!ID_VALIDO.test(id)) {
    return responde({ error: "identificador no valido" }, 400);
  }

  try {
    if (request.method === "GET") {
      const datos = await env.RUTINA.get(id, { type: "json" });
      if (!datos) return responde({ vacio: true }, 404);
      return responde(datos);
    }

    if (request.method === "PUT") {
      const cuerpo = await request.text();
      if (cuerpo.length > LIMITE) return responde({ error: "demasiado grande" }, 413);

      let datos;
      try { datos = JSON.parse(cuerpo); }
      catch (e) { return responde({ error: "no es JSON" }, 400); }

      // Comprobamos la forma, no el contenido: el contenido es ilegible a proposito.
      if (!datos || typeof datos.ct !== "string" || typeof datos.iv !== "string" ||
          typeof datos.salt !== "string") {
        return responde({ error: "faltan campos del cifrado" }, 400);
      }

      /* Escritura condicional. El cliente dice de que version partia ("si").
         Si mientras fusionaba entro otra, se le rechaza y vuelve a empezar.
         Sin esto queda una rendija estrecha pero real: dos dispositivos leen
         a la vez, fusionan cada uno por su lado, y el segundo en escribir tapa
         al primero. Es exactamente el fallo que este cambio viene a cerrar. */
      if (typeof datos.si === "string") {
        const actual = await env.RUTINA.get(id, { type: "json" });
        const tsActual = actual && actual.ts;
        if (tsActual && tsActual !== datos.si) {
          return responde({ error: "alguien ha escrito antes", ts: tsActual }, 409);
        }
        delete datos.si;
      }

      datos.ts = new Date().toISOString();
      await env.RUTINA.put(id, JSON.stringify(datos));
      return responde({ ok: true, ts: datos.ts });
    }

    return responde({ error: "metodo no permitido" }, 405);
  } catch (e) {
    return responde({ error: "fallo del almacen" }, 500);
  }
}
