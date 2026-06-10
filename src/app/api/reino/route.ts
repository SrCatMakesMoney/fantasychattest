import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ensureReign, maybeGenerateEvent } from "@/lib/reino";
import { Reign } from "@/models/Reign";
import { RealmEvent } from "@/models/RealmEvent";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    await ensureReign();
    await maybeGenerateEvent();

    const reign = await Reign.findOne()
      .sort({ createdAt: -1 })
      .populate("king", "username displayName avatar realm badges");

    const eventos = await RealmEvent.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("involvedUsers", "username displayName avatar");

    return Response.json({
      reinado: reign,
      eventos,
      esRey: reign ? String(reign.king._id) === session.userId : false,
    });
  } catch (error) {
    console.error("Error en el reino:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
