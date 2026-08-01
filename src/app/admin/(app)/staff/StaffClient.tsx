"use client";
import { useState, useTransition } from "react";
import { createStaffMember, updateStaffRole, deleteStaffMember } from "../../actions";

type StaffMember = {
  id: string;
  authId: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
};

const ROLE_STYLES = {
  ADMIN: "text-brand-caramel bg-brand-caramel/10 border-brand-caramel/30",
  STAFF: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export default function StaffClient({
  staff,
  currentId,
  superadminEmail,
}: {
  staff: StaffMember[];
  currentId: string;
  superadminEmail: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" as "ADMIN" | "STAFF" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      try {
        await createStaffMember(fd);
        setShowForm(false);
        setForm({ name: "", email: "", password: "", role: "STAFF" });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create member");
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-body text-xs font-semibold tracking-[0.2em] uppercase px-6 py-3 bg-brand-flame hover:bg-brand-flame-dark text-white transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-brand-surface border border-brand-caramel/30 p-6 mb-6">
          <h3 className="font-heading text-2xl text-brand-white tracking-wide mb-5">NEW TEAM MEMBER</h3>
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "jane@provit.site" },
              { label: "Password", key: "password", type: "password", placeholder: "Min. 8 characters" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                  placeholder={placeholder}
                  className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 outline-none focus:border-brand-caramel transition-colors placeholder:text-brand-muted/40"
                />
              </div>
            ))}
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "STAFF" }))}
                className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 outline-none focus:border-brand-caramel transition-colors"
              >
                <option value="STAFF">Staff — Orders, Products, Inventory, Customers</option>
                <option value="ADMIN">Admin — Full access + Stats + Team management</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="font-body text-xs text-brand-flame bg-brand-flame/10 border border-brand-flame/20 px-4 py-3 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="font-body text-xs font-semibold tracking-[0.2em] uppercase px-8 py-3 bg-brand-caramel hover:bg-brand-caramel-light text-white transition-colors disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create Member"}
          </button>
        </form>
      )}

      <div className="bg-brand-surface border border-brand-border">
        {staff.length === 0 && (
          <p className="text-center font-body text-sm text-brand-muted py-16">No team members yet</p>
        )}
        {staff.map((member) => {
          const isMe = member.id === currentId;
          const isSuperadmin = member.email === superadminEmail;

          return (
            <div key={member.id} className="flex items-center gap-4 px-5 py-4 border-b border-brand-border last:border-0">
              <div className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-base text-brand-caramel leading-none">
                  {(member.name ?? member.email).charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-body text-xs font-semibold text-brand-white">{member.name ?? "—"}</p>
                  {isSuperadmin && (
                    <span className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-flame border border-brand-flame/30 px-1.5 py-0.5">
                      Superadmin
                    </span>
                  )}
                  {isMe && !isSuperadmin && (
                    <span className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted border border-brand-border px-1.5 py-0.5">
                      You
                    </span>
                  )}
                </div>
                <p className="font-body text-[11px] text-brand-muted">{member.email}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Role — superadmin and self are read-only */}
                {!isMe && !isSuperadmin ? (
                  <select
                    defaultValue={member.role}
                    disabled={pending}
                    onChange={(e) => startTransition(() => updateStaffRole(member.id, e.target.value as "ADMIN" | "STAFF"))}
                    className="bg-brand-card border border-brand-border text-brand-white font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 outline-none focus:border-brand-caramel"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span className={`font-body text-[9px] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 border ${ROLE_STYLES[member.role]}`}>
                    {member.role}
                  </span>
                )}

                {/* Remove — only non-superadmin, non-self members */}
                {!isMe && !isSuperadmin && (
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`Remove ${member.name ?? member.email}?`)) return;
                      startTransition(() => deleteStaffMember(member.id, member.authId));
                    }}
                    className="font-body text-[10px] tracking-[0.1em] uppercase text-brand-muted hover:text-brand-flame transition-colors px-2 py-1 border border-transparent hover:border-brand-flame/30 disabled:opacity-40"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
