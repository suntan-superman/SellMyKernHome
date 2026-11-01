"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminPasswordField() {
  const [visible, setVisible] = useState(false);

  return <>
    <label htmlFor="admin-password">Password</label>
    <div className="password-input-wrap">
      <input
        className="password-input"
        id="admin-password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        required
      />
      <button
        className="password-visibility-button"
        type="button"
        aria-controls="admin-password"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  </>;
}
