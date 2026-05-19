"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { adminFetch, getAdminSecret, setAdminSecret } from "@/utils/adminClient";
import {
  Users,
  FileText,
  Mail,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Lock,
} from "lucide-react";

const TABS = [
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "profiles", label: "Signups", icon: Users },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function DataTable({ columns, rows, empty }) {
  if (!rows?.length) {
    return <p className="text-sm text-neutral-500 py-8 text-center">{empty}</p>;
  }
  return (
    <motion.div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wide">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-neutral-50/80">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-neutral-800 max-w-xs truncate">
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
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

  useEffect(() => {
    if (getAdminSecret()) setUnlocked(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load");
        if (res.status === 401) {
          setAdminSecret(null);
          setUnlocked(false);
        }
        return;
      }
      setData(json);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked, load]);

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
            Enter your server <code className="text-xs bg-neutral-100 px-1 rounded">ADMIN_SECRET</code>{" "}
            to view leads, resumes, signups, contact messages, and chat.
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">HireOrbit Admin</h1>
            <p className="text-xs text-neutral-500">Supabase-backed overview</p>
          </div>
          <div className="flex items-center gap-2">
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
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Profiles", n: data.profiles?.length },
              { label: "Resumes", n: data.resumes?.length },
              { label: "Leads", n: data.leads?.length },
              { label: "Contact", n: data.contact_submissions?.length },
              { label: "Chat", n: data.chat_messages?.length },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{s.n ?? 0}</p>
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
                columns={[
                  { key: "email", label: "Email" },
                  { key: "name", label: "Name" },
                  { key: "source", label: "Source" },
                  { key: "created_at", label: "When", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.leads}
              />
            )}
            {tab === "profiles" && (
              <DataTable
                empty="No profiles yet — created on signup, upload, or chat."
                columns={[
                  { key: "email", label: "Email" },
                  { key: "full_name", label: "Name" },
                  {
                    key: "local_id",
                    label: "Type",
                    render: (r) => (r.auth_user_id ? "Auth" : r.local_id ? "Local demo" : "—"),
                  },
                  { key: "created_at", label: "Joined", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.profiles}
              />
            )}
            {tab === "resumes" && (
              <DataTable
                empty="No resumes uploaded yet."
                columns={[
                  {
                    key: "file_name",
                    label: "File",
                    render: (r) => (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline truncate block max-w-[200px]"
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
                columns={[
                  { key: "email", label: "Email" },
                  { key: "name", label: "Name" },
                  {
                    key: "message",
                    label: "Message",
                    render: (r) => (
                      <span className="line-clamp-2 max-w-md" title={r.message}>
                        {r.message}
                      </span>
                    ),
                  },
                  { key: "created_at", label: "When", render: (r) => formatDate(r.created_at) },
                ]}
                rows={data?.contact_submissions}
              />
            )}
            {tab === "chat" && (
              <DataTable
                empty="No chat messages."
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
                    render: (r) => (
                      <span className="line-clamp-2 max-w-md" title={r.content}>
                        {r.content}
                      </span>
                    ),
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
