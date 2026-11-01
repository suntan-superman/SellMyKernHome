import { NextResponse } from "next/server";
import { getAdminContext, isSameOriginRequest } from "@/lib/admin-session";
import { updateAdminLead } from "@/lib/admin-data";

export async function POST(request, { params }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 16 * 1024) return NextResponse.json({ message: "The request is too large." }, { status: 413 });
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
  const { id } = await params;
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ message: "The request body was not valid JSON." }, { status: 400 }); }
  const result = await updateAdminLead(context, id, input);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status, headers: { "Cache-Control": "private, no-store" } });
}
