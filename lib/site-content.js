import "server-only";
import { createPublicAuthClient } from "./supabase";

const DEFAULT_HOMEPAGE_IMAGE = "/images/craftsman-home-exterior-v2.webp";

export async function getPublicSiteContent() {
  const client = createPublicAuthClient();
  if (!client) return { homepageImage: DEFAULT_HOMEPAGE_IMAGE, testimonials: [] };
  try {
    const [{ data: setting }, { data: testimonials }] = await Promise.all([
      client.from("smkh_site_settings").select("value").eq("key", "homepage_image").maybeSingle(),
      client.from("smkh_testimonials").select("id,quote,attribution,sort_order").eq("status", "published").order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(12),
    ]);
    return { homepageImage: setting?.value || DEFAULT_HOMEPAGE_IMAGE, testimonials: testimonials || [] };
  } catch { return { homepageImage: DEFAULT_HOMEPAGE_IMAGE, testimonials: [] }; }
}
