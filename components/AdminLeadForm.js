"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import { leadStatuses, statusLabel } from "@/lib/admin-shared";

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function isoOrEmpty(value) {
  return value ? new Date(value).toISOString() : "";
}

export default function AdminLeadForm({ lead, canEdit }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!canEdit || busy) return;
    setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.get("status"),
          internalNotes: form.get("internalNotes"),
          followUpAt: isoOrEmpty(form.get("followUpAt")),
          lastContactedAt: isoOrEmpty(form.get("lastContactedAt")),
        }),
      });
      const result = await response.json();
      if (!response.ok) { setMessage(result.message || "The lead could not be updated."); return; }
      setMessage("Lead saved.");
      router.refresh();
    } catch {
      setMessage("The lead could not be updated. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="admin-edit-form" onSubmit={submit}>
    <label htmlFor="admin-status">Status</label>
    <select id="admin-status" name="status" defaultValue={lead.status} disabled={!canEdit || busy}>
      {leadStatuses.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}
    </select>
    <label htmlFor="admin-follow-up">Follow-up date</label>
    <input id="admin-follow-up" name="followUpAt" type="datetime-local" defaultValue={localDateTime(lead.follow_up_at)} disabled={!canEdit || busy} />
    <label htmlFor="admin-last-contacted">Last contacted</label>
    <input id="admin-last-contacted" name="lastContactedAt" type="datetime-local" defaultValue={localDateTime(lead.last_contacted_at)} disabled={!canEdit || busy} />
    <label htmlFor="admin-notes">Internal notes</label>
    <textarea id="admin-notes" name="internalNotes" rows="10" maxLength="10000" defaultValue={lead.internal_notes || ""} disabled={!canEdit || busy} />
    {!canEdit ? <p className="admin-form-note">This membership has read-only access.</p> : null}
    {message ? <p className="admin-form-message" role="status">{message}</p> : null}
    <button className="button" type="submit" disabled={!canEdit || busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Saving…</> : <><Save size={18} /> Save follow-up</>}</button>
  </form>;
}
