import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("imagen") as File | null;

    if (!file) {
      return Response.json({ error: "No se envio imagen" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "La imagen es muy grande (max 2MB)" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "Solo se permiten imagenes" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return Response.json({ url: dataUrl });
  } catch (error) {
    console.error("Error al subir:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
