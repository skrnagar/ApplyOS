"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  adminFetchJson,
  adminDeleteRecord,
  getAdminSecret,
  setAdminSecret,
} from "@/utils/adminClient";
import {
  Users,
  FileText,
  Mail,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Lock,
  Briefcase,
  Shield,
  Trash2,
} from "lucide-react";

const TABS = [
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "auth_users", label: "Auth users", icon: Shield },
  { id: "applications", label: "Applications", icon: Briefcase },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

const DELETE_TABLE = {
  leads: "leads",
  profiles: "profiles",
  auth_users: null,
  applications: "applications",
  resumes: "resumes",
  contact: "contact_submissions",
  chat: "chat_messages",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function DataTable({ columns, rows, empty, onDelete }) {
  if (!rows?.length) {
    return <p className="text-sm text-neutral-500 py-8 text-center">{empty}</p>;
  }
  return (
    <motion.div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wide">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {onDelete ? (
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-neutral-50/80 align-top">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 text-neutral-800 ${c.wide ? "max-w-md whitespace-normal" : "max-w-xs truncate"}`}
                >
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
              {onDelete ? (
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export default function AdminPage() {
  const [secretInput, setSecretInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("leads");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [errorHint, setErrorHint] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (getAdminSecret()) setUnlocked(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setErrorHint(null);
    setWarnings([]);
    try {
      const json = await adminFetchJson("/api/admin/overview");
      setData(json);
      if (json.warnings?.length) setWarnings(json.warnings);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
      setErrorDetails(err.details || null);
      setErrorHint(err.hint || null);
      if (err.status === 401) {
        setAdminSecret(null);
        setUnlocked(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked, load]);

  const handleDelete = async (row) => {
    const table = DELETE_TABLE[tab];
    if (!table || !row?.id) return;
    const label = row.email || row.file_name || row.company_name || row.id;
    if (!window.confirm(`Delete this ${tab.slice(0, -1)} record?\n\n${label}`)) return;
    try {
      await adminDeleteRecord(table, row.id);
      await load();
    } catch (err) {
      window.alert(err.message || "Delete failed");
    }
  };

  const onUnlock = (e) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    setUnlocked(true);
    setSecretInput("");
  };

  const onLogout = () => {
    setAdminSecret(null);
    setUnlocked(false);
    setData(null);
  };

  if (!unlocked) {
    return (
      <motion.div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <form
          onSubmit={onUnlock}
          className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <motion.div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
            <Lock className="text-emerald-700" size={24} />
          </motion.div>
          <h1 className="text-xl font-semibold text-neutral-900">Admin dashboard</h1>
          <p className="text-sm text-neutral-600 mt-2 mb-6">
            Enter the same value as <code className="text-xs bg-neutral-100 px-1 rounded">ADMIN_SECRET</code> in{" "}
            <code className="text-xs bg-neutral-100 px-1 rounded">web/.env.local</code> (e.g.{" "}
            <code className="text-xs bg-neutral-100 px-1 rounded">Pllav</code>).
          </p>
          <input
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Admin secret"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 mb-4 text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700"
          >
            Unlock
          </button>
        </form>
      </motion.div>
    );
  }

  const counts = data?.counts || {};

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">HireOrbit Admin</h1>
            <p className="text-xs text-neutral-500">View & manage all Supabase data</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Site
            </a>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Lock
            </button>
          </div>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-2">
            <p className="font-medium">{error}</p>
            {errorHint && <p className="text-red-900/90">{errorHint}</p>}
            {errorDetails?.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-red-900/80 space-y-0.5">
                {errorDetails.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 space-y-1">
            <p className="font-medium">Some data could not be loaded</p>
            <ul className="list-disc pl-5 text-xs">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="text-xs mt-1">
              Run missing migrations in Supabase SQL Editor (see{" "}
              <code className="bg-amber-100 px-1 rounded">web/supabase/migrations/</code>).
            </p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {[
              { label: "Profiles", n: counts.profiles },
              { label: "Auth users", n: counts.auth_users },
              { label: "Applications", n: counts.applications },
              { label: "Resumes", n: counts.resumes },
              { label: "Leads", n: counts.leads },
              { label: "Contact", n: counts.contact },
              { label: "Chat", n: counts.chat },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 shadow-sm"
              >
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">{s.label}</p>
                <p className="text-xl font-bold text-neutral-900">{s.n ?? 0}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === "leads" && (
              <DataTable
                empty="No leads yet."
                onDelete={handleDelete}
                columns={[
                  { key: "email", label: "Email" },
                  { key: "name", label: "Name" },
                  { key: "source", label: "Source" },
                  {
                    key: "metadata",
                    label: "Meta",
                    render: (r) =>
                      r.metadata && Object.keys(r.metadata).length
                        ? JSON.stringify(r.metadata)
                        : "—",
                  },
                  { key: "created_at", label: "When", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.leads}
              />
            )}
            {tab === "profiles" && (
              <DataTable
                empty="No profiles yet."
                onDelete={handleDelete}
                columns={[
                  { key: "email", label: "Email" },
                  { key: "full_name", label: "Name" },
                  {
                    key: "auth_user_id",
                    label: "Auth ID",
                    render: (r) => (
                      <span className="font-mono text-xs">{r.auth_user_id?.slice(0, 8) ?? "—"}…</span>
                    ),
                  },
                  {
                    key: "local_id",
                    label: "Type",
                    render: (r) => (r.auth_user_id ? "Supabase Auth" : r.local_id ? "Local demo" : "—"),
                  },
                  { key: "created_at", label: "Joined", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.profiles}
              />
            )}
            {tab === "auth_users" && (
              <DataTable
                empty="No auth users (check service role key)."
                columns={[
                  { key: "email", label: "Email" },
                  {
                    key: "user_metadata",
                    label: "Name",
                    render: (r) =>
                      r.user_metadata?.full_name || r.user_metadata?.name || "—",
                  },
                  {
                    key: "email_confirmed_at",
                    label: "Confirmed",
                    render: (r) => (r.email_confirmed_at ? "Yes" : "Pending"),
                  },
                  { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at) },
                  {
                    key: "last_sign_in_at",
                    label: "Last sign-in",
                    render: (r) => formatDate(r.last_sign_in_at),
                  },
                ]}
                rows={data?.auth_users}
              />
            )}
            {tab === "applications" && (
              <DataTable
                empty="No applications yet. Run applications migration if the table is missing."
                onDelete={handleDelete}
                columns={[
                  { key: "job_title", label: "Role" },
                  { key: "company_name", label: "Company" },
                  { key: "status", label: "Status" },
                  {
                    key: "email",
                    label: "User",
                    render: (r) => r.profiles?.email || r.profile_id,
                  },
                  { key: "created_at", label: "Added", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.applications}
              />
            )}
            {tab === "resumes" && (
              <DataTable
                empty="No resumes uploaded yet."
                onDelete={handleDelete}
                columns={[
                  {
                    key: "file_name",
                    label: "File",
                    render: (r) => (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        {r.file_name}
                      </a>
                    ),
                  },
                  {
                    key: "email",
                    label: "User",
                    render: (r) => r.profiles?.email || r.profile_id,
                  },
                  {
                    key: "ats_score",
                    label: "ATS",
                    render: (r) => (r.ats_score != null ? `${r.ats_score}%` : "—"),
                  },
                  { key: "created_at", label: "Uploaded", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.resumes}
              />
            )}
            {tab === "contact" && (
              <DataTable
                empty="No contact submissions."
                onDelete={handleDelete}
                columns={[
                  { key: "email", label: "Email" },
                  { key: "name", label: "Name" },
                  {
                    key: "message",
                    label: "Message",
                    wide: true,
                    render: (r) => r.message,
                  },
                  { key: "created_at", label: "When", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.contact_submissions}
              />
            )}
            {tab === "chat" && (
              <DataTable
                empty="No chat messages."
                onDelete={handleDelete}
                columns={[
                  {
                    key: "email",
                    label: "User",
                    render: (r) => r.profiles?.email || r.profile_id,
                  },
                  { key: "sender_type", label: "From" },
                  {
                    key: "content",
                    label: "Message",
                    wide: true,
                    render: (r) => r.content,
                  },
                  { key: "created_at", label: "When", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.chat_messages}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
