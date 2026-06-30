import { destroySession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  await destroySession();
  return NextResponse.json({ ok: true });
}
