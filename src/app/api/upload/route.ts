import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, uploadToImgbb } from "@/lib/imgbb";

export const runtime = "nodejs";

/**
 * Accepts a multipart upload from the client and forwards it to ImgBB
 * (the API key never reaches the browser). Returns only the secure URL.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  const kind = String(form?.get("kind") ?? "image");

  if (!(file instanceof File)) return NextResponse.json({ error: "No image provided" }, { status: 400 });
  if (!ACCEPTED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Use a JPG, PNG, WEBP or GIF image" }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Image must be under 8 MB" }, { status: 413 });

  try {
    const url = await uploadToImgbb(file, `${kind}-${session.user.id.slice(0, 8)}-${Date.now()}`);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
