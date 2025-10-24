import { NextResponse } from "next/server";
import { createLivekitToken } from "@/lib/livekitToken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const identity = searchParams.get("identity") || "guest";
  const room = searchParams.get("room") || "default";

  const token = await createLivekitToken(identity, room); // <-- thêm await
  return NextResponse.json({ token });
}
