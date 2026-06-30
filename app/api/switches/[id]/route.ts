import { db } from "@/db";
import { switches } from "@/db/schema";
import { getSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [existing] = await db
    .select({ status: switches.status })
    .from(switches)
    .where(and(eq(switches.id, id), eq(switches.userId, session.userId)));

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "active") {
    return NextResponse.json(
      { error: "Only active switches can be cancelled" },
      { status: 409 },
    );
  }

  await db
    .update(switches)
    .set({ status: "cancelled", encryptedMessage: "" })
    .where(and(eq(switches.id, id), eq(switches.userId, session.userId)));

  return NextResponse.json({ ok: true });
}
