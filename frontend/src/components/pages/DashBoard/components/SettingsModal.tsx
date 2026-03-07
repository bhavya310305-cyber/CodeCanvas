import { useState } from "react";
import { User, Lock, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { getInitials } from "../utils";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  user: { id: string; name: string; email: string } | null;
  setUser: (u: User | null) => void;
  onLogout: () => void;
}

export function SettingsModal({ open, onClose, isDark, user, setUser, onLogout }: Props) {
  const [tab, setTab] = useState<"profile" | "password" | "danger">("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [delMsg, setDelMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const T = {
    bg:        isDark ? "#111827" : "#f1f5f9",
    border:    isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)",
    text:      isDark ? "rgba(255,255,255,0.88)" : "#0f172a",
    textMuted: isDark ? "rgba(255,255,255,0.4)"  : "#64748b",
    inputBg:   isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.06)",
    tabActive: isDark ? "rgba(59,130,246,0.15)"  : "rgba(59,130,246,0.1)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
    background: T.inputBg, border: `1px solid ${T.border}`,
    color: T.text, fontFamily: "'Inter',sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: T.textMuted,
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: 6, display: "block",
  };

  async function handleSaveName() {
    if (!name.trim()) { setNameErr(true); setNameMsg("Name cannot be empty."); return; }
    setLoading(true); setNameErr(false); setNameMsg("");
    try {
      const res = await api.put("/auth/update-name", { name: name.trim() });
      const u = res.data.user;
      setUser({ id: u._id, name: u.fullName, email: u.email });
      setNameMsg("Name updated successfully.");
    } catch {
      setNameErr(true); setNameMsg("Failed to update name. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) { setPwErr(true); setPwMsg("All fields are required."); return; }
    if (newPw !== confirmPw) { setPwErr(true); setPwMsg("New passwords do not match."); return; }
    if (newPw.length < 6) { setPwErr(true); setPwMsg("Password must be at least 6 characters."); return; }
    setLoading(true); setPwErr(false); setPwMsg("");
    try {
      await api.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      setPwMsg("Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setPwErr(true);
        setPwMsg(axiosErr?.response?.data?.message ?? "Failed to change password.");
    } 
    finally { setLoading(false); }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") { setDelMsg("Type DELETE exactly to confirm."); return; }
    setLoading(true);
    try {
      await api.delete("/auth/delete-account");
      onLogout();
    } catch {
      setDelMsg("Failed to delete account. Please try again.");
    } finally { setLoading(false); }
  }

  const tabs = [
    { key: "profile",  label: "Profile",     icon: <User style={{ width: 14, height: 14 }} /> },
    { key: "password", label: "Password",    icon: <Lock style={{ width: 14, height: 14 }} /> },
    { key: "danger",   label: "Danger Zone", icon: <Trash2 style={{ width: 14, height: 14 }} /> },
  ] as const;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 480, borderRadius: 16, overflow: "hidden", background: T.bg, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Settings</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: T.inputBg, border: `1px solid ${T.border}`, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "10px 12px", borderBottom: `1px solid ${T.border}` }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'Inter',sans-serif", border: "none", transition: "all 0.15s", background: tab === t.key ? T.tabActive : "transparent", color: tab === t.key ? "#60a5fa" : T.textMuted }}
            >{t.icon}{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>

          {/* Profile */}
          {tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {getInitials(name || user?.name || "")}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{name || user?.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{user?.email}</div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your full name" />
              </div>
              {nameMsg && (
                <div style={{ fontSize: 12, color: nameErr ? "#f87171" : "#4ade80", padding: "8px 12px", borderRadius: 8, background: nameErr ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)", border: `1px solid ${nameErr ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}` }}>
                  {nameMsg}
                </div>
              )}
              <button onClick={handleSaveName} disabled={loading}
                style={{ padding: "9px 0", borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Inter',sans-serif" }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Password */}
          {tab === "password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="••••••••" />
              </div>
              {pwMsg && (
                <div style={{ fontSize: 12, color: pwErr ? "#f87171" : "#4ade80", padding: "8px 12px", borderRadius: 8, background: pwErr ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)", border: `1px solid ${pwErr ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}` }}>
                  {pwMsg}
                </div>
              )}
              <button onClick={handleChangePassword} disabled={loading}
                style={{ padding: "9px 0", borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Inter',sans-serif" }}>
                {loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          )}

          {/* Danger */}
          {tab === "danger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#f87171" : "#dc2626", marginBottom: 4 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>This action is permanent and cannot be undone. All your snippets will be deleted.</div>
              </div>
              <div>
                <label style={labelStyle}>Type <span style={{ color: isDark ? "#f87171" : "#dc2626", fontFamily: "monospace" }}>DELETE</span> to confirm</label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} style={{ ...inputStyle, border: "1px solid rgba(239,68,68,0.3)" }} placeholder="DELETE" />
              </div>
              {delMsg && (
                <div style={{ fontSize: 12, color: "#f87171", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {delMsg}
                </div>
              )}
              <button onClick={handleDeleteAccount} disabled={loading || deleteConfirm !== "DELETE"}
                style={{ padding: "9px 0", borderRadius: 9, background: deleteConfirm === "DELETE" ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", color: deleteConfirm === "DELETE" ? "white" : (isDark ? "#f87171" : "#dc2626"), fontSize: 13, fontWeight: 600, cursor: deleteConfirm === "DELETE" && !loading ? "pointer" : "not-allowed", opacity: loading ? 0.7 : 1, fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}>
                {loading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}