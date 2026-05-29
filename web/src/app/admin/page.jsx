"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  adminFetchJson,
  adminDeleteRecord,
  checkAdminSessionSafe,
  setProfileAdmin,
  getAdminSecret,
  setAdminSecret,
} from "@/utils/adminClient";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import {
  Users,
  FileText,
  Mail,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Briefcase,
  Shield,
  Trash2,
  Inbox,
} from "lucide-react";
import AdminChatPanel from "@/components/admin/AdminChatPanel";
import AdminApplicationsPanel from "@/components/admin/AdminApplicationsPanel";
import { formatApplicationTargetsSummary, hasApplicationTargets } from "@/utils/jobPreferences";

const TABS = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "auth_users", label: "Auth users", icon: Shield },
  { id: "applications", label: "Applications", icon: Briefcase },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "chat", label: "Chat log", icon: MessageSquare },
];

const DELETE_TABLE = {
  inbox: null,
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
  const { data: authUser, loading: authLoading } = useUser();
  const { signOut } = useAuth();
  const supabaseAuth = isSupabaseAuthEnabled();

  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [adminEmail, setAdminEmail] = useState(null);
  const [tab, setTab] = useState("inbox");
  const [chatProfileId, setChatProfileId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [errorHint, setErrorHint] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const verifyAdminAccess = useCallback(async () => {
    if (getAdminSecret()) {
      setUnlocked(true);
      setAuthChecked(true);
      return { admin: true, method: "secret" };
    }
    const session = await checkAdminSessionSafe();
    if (session.admin) {
      setUnlocked(true);
      setAdminEmail(session.email || authUser?.email || null);
      setError(null);
      setErrorHint(null);
    } else {
      setUnlocked(false);
      if (session.error && (authUser?.email || session.status === 403)) {
        setError(session.error);
        setErrorHint(session.hint || null);
      }
    }
    setAuthChecked(true);
    return session;
  }, [authUser?.email]);

  useEffect(() => {
    if (authLoading) return;
    void verifyAdminAccess();
  }, [authLoading, authUser?.email, verifyAdminAccess]);

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
      if (err.status === 401 || err.status === 403) {
        setAdminSecret(null);
        setUnlocked(false);
        void verifyAdminAccess();
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

  const onSecretUnlock = () => {
    setUnlocked(true);
    setError(null);
  };

  const onAdminUnlocked = (email) => {
    setUnlocked(true);
    setAdminEmail(email || authUser?.email || null);
    setError(null);
    setErrorHint(null);
  };

  const onLogout = async () => {
    setAdminSecret(null);
    setUnlocked(false);
    setData(null);
    setAdminEmail(null);
    if (supabaseAuth) await signOut({ redirect: false });
    setAuthChecked(false);
    void verifyAdminAccess();
  };

  if (!authChecked || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500">Checking admin access…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <AdminSignInGate
        authUser={authUser}
        initialError={error}
        initialHint={errorHint}
        onUnlocked={onAdminUnlocked}
        onSecretUnlock={onSecretUnlock}
        verifyAdminAccess={verifyAdminAccess}
      />
    );
  }

  const counts = data?.counts || {};

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">HireOrbital Admin</h1>
            <p className="text-xs text-neutral-500">
              {adminEmail ? `Signed in as ${adminEmail}` : "View & manage all Supabase data"}
              {" · "}
              Alerts → hireorbit.1@gmail.com
            </p>
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

        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-52 shrink-0 flex lg:flex-col flex-wrap gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  if (id !== "inbox") setChatProfileId(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  tab === id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
        {loading && !data && tab !== "inbox" ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === "inbox" && (
              <AdminChatPanel
                profiles={data?.profiles || []}
                initialProfileId={chatProfileId}
              />
            )}
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
                    key: "job_preferences",
                    label: "Apply targets",
                    wide: true,
                    render: (r) =>
                      hasApplicationTargets(r.job_preferences) ? (
                        <span className="text-emerald-800 text-xs leading-relaxed">
                          {formatApplicationTargetsSummary(r.job_preferences)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">Not set</span>
                      ),
                  },
                  {
                    key: "is_admin",
                    label: "Admin",
                    render: (r) =>
                      r.is_admin ? (
                        <span className="text-emerald-700 font-medium">Yes</span>
                      ) : (
                        "No"
                      ),
                  },
                  {
                    key: "is_admin_action",
                    label: "Access",
                    render: (r) => (
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await setProfileAdmin(r.id, !r.is_admin);
                              await load();
                            } catch (err) {
                              window.alert(err.message || "Failed to update");
                            }
                          }}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          {r.is_admin ? "Revoke admin" : "Make admin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChatProfileId(r.id);
                            setTab("inbox");
                          }}
                          className="text-xs font-medium text-neutral-600 hover:underline"
                        >
                          Message
                        </button>
                      </div>
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
              <AdminApplicationsPanel
                profiles={data?.profiles}
                applications={data?.applications}
                onRefresh={load}
                onDelete={handleDelete}
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
          </div>
        </div>
      </main>
    </div>
  );
}
