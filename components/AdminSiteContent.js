"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "/api/admin/site-content";
const EMPTY = { quote: "", attribution: "", status: "draft", sortOrder: 0 };

export default function AdminSiteContent() {
  const router = useRouter();
  const [data, setData] = useState({ homepageImage: "/images/craftsman-home-exterior-v2.webp", testimonials: [] });
  const [edit, setEdit] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch(API, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Content could not be loaded.");
    setData(result);
  }
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);
  async function uploadImage(event) {
    event.preventDefault(); if (!file) return;
    setBusy(true); setMessage("");
    try {
      const body = new FormData(); body.set("image", file);
      const response = await fetch(`${API}/image`, { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Image upload failed.");
      setData((current) => ({ ...current, homepageImage: result.imageUrl })); setFile(null); event.currentTarget.reset(); setMessage("Homepage image updated."); router.refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function saveTestimonial(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation: "upsert", ...edit }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Testimonial could not be saved.");
      setEdit(EMPTY); await load(); setMessage("Testimonial saved."); router.refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm("Delete this testimonial?")) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation: "delete", id }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Testimonial could not be deleted.");
      await load(); setMessage("Testimonial deleted."); router.refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <div className="smkh-content-admin">
    <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">PUBLIC WEBSITE</p><h2>Homepage image</h2><p>Upload a JPG, PNG, or WebP image up to 8 MB.</p></div></div><img className="smkh-home-preview" src={data.homepageImage} alt="Current homepage image preview"/><form onSubmit={uploadImage} className="smkh-content-form"><label htmlFor="homepage-image">Choose replacement image</label><input id="homepage-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} required/><button className="button" type="submit" disabled={busy || !file}>{busy ? "Uploading…" : "Upload and publish image"}</button></form></section>
    <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h2>Testimonials</h2><p>Publish only genuine feedback that you are authorized to share.</p></div></div>
      {data.testimonials.length ? <div className="admin-lead-list">{data.testimonials.map((item) => <article className="admin-lead-row" key={item.id}><div><strong>{item.quote}</strong><span>{item.attribution || "No attribution"}</span></div><div className="admin-lead-meta"><span className={`status-pill status-${item.status}`}>{item.status}</span><button type="button" className="text-button" onClick={() => setEdit({ id: item.id, quote: item.quote, attribution: item.attribution || "", status: item.status, sortOrder: item.sort_order || 0 })}>Edit</button><button type="button" className="text-button" disabled={busy} onClick={() => remove(item.id)}>Delete</button></div></article>)}</div> : <p className="admin-empty">No testimonials are published or in draft.</p>}
      <form onSubmit={saveTestimonial} className="smkh-content-form"><h3>{edit.id ? "Edit testimonial" : "Add testimonial"}</h3><label htmlFor="testimonial-quote">Quote</label><textarea id="testimonial-quote" maxLength={1600} rows={4} value={edit.quote} onChange={(event) => setEdit({ ...edit, quote: event.target.value })} required/><label htmlFor="testimonial-attribution">Attribution (optional)</label><input id="testimonial-attribution" maxLength={160} value={edit.attribution} onChange={(event) => setEdit({ ...edit, attribution: event.target.value })}/><label htmlFor="testimonial-order">Display order</label><input id="testimonial-order" type="number" min={-10000} max={10000} value={edit.sortOrder} onChange={(event) => setEdit({ ...edit, sortOrder: event.target.value })}/><label htmlFor="testimonial-status">Visibility</label><select id="testimonial-status" value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value })}><option value="draft">Draft — hidden</option><option value="published">Published — visible</option></select><div className="admin-detail-actions"><button className="button" disabled={busy}>{busy ? "Saving…" : "Save testimonial"}</button><button className="button button-secondary" type="button" disabled={busy} onClick={() => setEdit(EMPTY)}>Clear</button></div></form>
    </section>{message && <p className="smkh-content-message" role="status">{message}</p>}
  </div>;
}
