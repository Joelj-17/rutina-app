import { getStore } from "@netlify/blobs";

/* Guarda y devuelve un bloque cifrado. El servidor NUNCA ve nada legible:
   el cifrado y el descifrado ocurren en el navegador del usuario.

   Aquí solo llegan tres cosas: un identificador opaco, un montón de bytes
   ilegibles y una marca de tiempo. No hay cuentas, ni correos, ni nada
   que asocie ese bloque con una persona.

   El identificador se deriva de la frase de acceso con SHA-256, así que
   adivinarlo es tan difícil como adivinar la frase.                        */

const CABECERAS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store"
};

const LIMITE = 2 * 1024 * 1024;          // 2 MB: de sobra para años de registro
const ID_VALIDO = /^[a-f0-9]{64}$/;      // exactamente un SHA-256 en hexadecimal

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CABECERAS });

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!ID_VALIDO.test(id)) {
    return Response.json({ error: "identificador no válido" }, { status: 400, headers: CABECERAS });
  }

  const almacen = getStore({ name: "rutina", consistency: "strong" });

  try {
    if (req.method === "GET") {
      const datos = await almacen.get(id, { type: "json" });
      if (!datos) return Response.json({ vacio: true }, { status: 404, headers: CABECERAS });
      return Response.json(datos, { headers: CABECERAS });
    }

    if (req.method === "PUT") {
      const cuerpo = await req.text();
      if (cuerpo.length > LIMITE) {
        return Response.json({ error: "demasiado grande" }, { status: 413, headers: CABECERAS });
      }
      let datos;
      try { datos = JSON.parse(cuerpo); } catch {
        return Response.json({ error: "no es JSON" }, { status: 400, headers: CABECERAS });
      }
      // Comprobamos la forma, no el contenido: el contenido es ilegible a propósito.
      if (!datos || typeof datos.ct !== "string" || typeof datos.iv !== "string" ||
          typeof datos.salt !== "string") {
        return Response.json({ error: "faltan campos del cifrado" }, { status: 400, headers: CABECERAS });
      }
      datos.ts = new Date().toISOString();
      await almacen.setJSON(id, datos);
      return Response.json({ ok: true, ts: datos.ts }, { headers: CABECERAS });
    }

    return Response.json({ error: "método no permitido" }, { status: 405, headers: CABECERAS });
  } catch (e) {
    return Response.json({ error: "fallo del almacén" }, { status: 500, headers: CABECERAS });
  }
};

export const config = { path: "/api/sync" };
