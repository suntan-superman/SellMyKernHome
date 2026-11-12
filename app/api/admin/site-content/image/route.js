import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminContext, isSameOriginRequest } from "@/lib/admin-session";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const imageTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export async function POST(request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
  if (!["owner", "admin"].includes(context.role)) return NextResponse.json({ message: "This account cannot edit public content." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > MAX_IMAGE_BYTES + 1024 * 1024) return NextResponse.json({ message: "The image must be 8 MB or smaller." }, { status: 413 });
  let form;
  try { form = await request.formData(); } catch { return NextResponse.json({ message: "Choose an image file." }, { status: 400 }); }
  const file = form.get("image");
  if (!file || typeof file.arrayBuffer !== "function" || !imageTypes.has(file.type) || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ message: "Choose a JPG, PNG, or WebP image up to 8 MB." }, { status: 422 });
  const extension = imageTypes.get(file.type);
  const path = `homepage/hero.${extension}`;
  const { error: uploadError } = await context.client.storage.from("smkh-site-content").upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true, cacheControl: "3600" });
  if (uploadError) return NextResponse.json({ message: "The upload failed. Apply the SMKH public-content migration and retry." }, { status: 503 });
  const { data } = context.client.storage.from("smkh-site-content").getPublicUrl(path);
  const imageUrl = `${data.publicUrl}?v=${randomUUID()}`;
  const { error: settingError } = await context.client.from("smkh_site_settings").upsert({ key: "homepage_image", value: imageUrl, updated_by: context.userId, updated_at: new Date().toISOString() });
  if (settingError) return NextResponse.json({ message: "The image was uploaded, but its homepage setting could not be saved. Apply the public-content migration and retry." }, { status: 503 });
  revalidatePath("/");
  return NextResponse.json({ ok: true, imageUrl });
}
