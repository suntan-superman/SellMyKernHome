import { NextResponse } from "next/server";
import { getAdminContext, isSameOriginRequest } from "@/lib/admin-session";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value, limit) => typeof value === "string" ? value.trim().slice(0, limit) : "";

async function admin(request, { checkOrigin = true } = {}) {
  if (checkOrigin && !isSameOriginRequest(request)) return { response: NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 }) };
  const context = await getAdminContext();
  if (!context) return { response: NextResponse.json({ message: "Admin authentication is required." }, { status: 401 }) };
  if (!["owner", "admin"].includes(context.role)) return { response: NextResponse.json({ message: "This account cannot edit public content." }, { status: 403 }) };
  return { context };
}

export async function GET(request) {
  const auth = await admin(request, { checkOrigin: false });
  if (auth.response) return auth.response;
  const [{ data: settings, error: settingsError }, { data: testimonials, error }] = await Promise.all([
    auth.context.client.from("smkh_site_settings").select("key,value,updated_at").eq("key", "homepage_image").maybeSingle(),
    auth.context.client.from("smkh_testimonials").select("id,quote,attribution,status,sort_order,created_at,updated_at").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
  ]);
  if (settingsError || error) return NextResponse.json({ message: "Content storage is unavailable. Apply the SMKH public-content migration, then retry." }, { status: 503 });
  return NextResponse.json({ homepageImage: settings?.value || "/images/craftsman-home-exterior-v2.webp", testimonials: testimonials || [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request) {
  const auth = await admin(request);
  if (auth.response) return auth.response;
  if (Number(request.headers.get("content-length") || 0) > 16 * 1024) return NextResponse.json({ message: "The request is too large." }, { status: 413 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "The request was not valid JSON." }, { status: 400 }); }
  const operation = body?.operation;
  if (operation === "upsert") {
    const quote = clean(body.quote, 1600); const attribution = clean(body.attribution, 160); const status = body.status;
    const sortOrder = Number(body.sortOrder || 0);
    if (!quote || !["draft", "published"].includes(status) || !Number.isInteger(sortOrder) || Math.abs(sortOrder) > 10000) return NextResponse.json({ message: "Enter a quote and valid publication status." }, { status: 422 });
    const record = { quote, attribution, status, sort_order: sortOrder, updated_at: new Date().toISOString() };
    if (body.id) {
      if (!UUID.test(body.id)) return NextResponse.json({ message: "Testimonial not found." }, { status: 404 });
      const { data, error } = await auth.context.client.from("smkh_testimonials").update(record).eq("id", body.id).select("id").maybeSingle();
      if (error || !data) return NextResponse.json({ message: "The testimonial could not be updated." }, { status: 500 });
    } else {
      record.created_by = auth.context.userId;
      const { error } = await auth.context.client.from("smkh_testimonials").insert(record);
      if (error) return NextResponse.json({ message: "The testimonial could not be created." }, { status: 500 });
    }
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }
  if (operation === "delete") {
    if (!UUID.test(String(body.id || ""))) return NextResponse.json({ message: "Testimonial not found." }, { status: 404 });
    const { error } = await auth.context.client.from("smkh_testimonials").delete().eq("id", body.id);
    if (error) return NextResponse.json({ message: "The testimonial could not be deleted." }, { status: 500 });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }
  if (operation === "homepage-image") {
    const imageUrl = clean(body.imageUrl, 2000);
    if (!imageUrl.startsWith("https://") || !imageUrl.includes("/storage/v1/object/public/smkh-site-content/homepage/")) return NextResponse.json({ message: "Choose an uploaded homepage image." }, { status: 422 });
    const { error } = await auth.context.client.from("smkh_site_settings").upsert({ key: "homepage_image", value: imageUrl, updated_by: auth.context.userId, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ message: "The homepage image could not be updated. Apply the SMKH public-content migration, then retry." }, { status: 503 });
    revalidatePath("/");
    return NextResponse.json({ ok: true, imageUrl });
  }
  return NextResponse.json({ message: "Unknown content operation." }, { status: 400 });
}
