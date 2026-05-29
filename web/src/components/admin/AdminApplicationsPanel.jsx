"use client";
import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus, Pencil } from "lucide-react";
import {
  adminCreateApplication,
  adminUpdateApplication,
} from "@/utils/adminClient";

const STATUSES = [
  { id: "applied", label: "Applied" },
  { id: "under_review", label: "Under Review" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
];

const defaultForm = {
  profile_id: "",
  company_name: "",
  job_title: "",
  job_location: "",
  status: "applied",
  application_url: "",
  notes: "",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function DataTable({ columns, rows, empty, onDelete, onEdit }) {
  if (!rows?.length) {
    return <p className="text-sm text-neutral-500 py-8 text-center">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wide">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {onDelete || onEdit ? (
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
              {onDelete || onEdit ? (
                <td className="px-4 py-3 text-right space-x-1">
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200"
                    >
                      Delete
                    </button>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminApplicationsPanel({
  profiles = [],
  applications = [],
  onRefresh,
  onDelete,
}) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const byCandidate = useMemo(() => {
    const map = new Map();
    for (const app of applications) {
      const email = app.profiles?.email || app.profile_id || "Unknown";
      map.set(email, (map.get(email) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [applications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.profile_id || !form.company_name.trim() || !form.job_title.trim()) {
      setError("Select a candidate, company, and job title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminCreateApplication({
        profile_id: form.profile_id,
        company_name: form.company_name,
        job_title: form.job_title,
        job_location: form.job_location || undefined,
        status: form.status,
        application_url: form.application_url || undefined,
        notes: form.notes || undefined,
      });
      setForm({ ...defaultForm, profile_id: form.profile_id });
      await onRefresh?.();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      company_name: row.company_name || "",
      job_title: row.job_title || "",
      job_location: row.job_location || "",
      status: row.status || "applied",
      application_url: row.application_url || "",
      notes: row.notes || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editRow?.id || !editForm) return;
    setSaving(true);
    setError(null);
    try {
      await adminUpdateApplication(editRow.id, editForm);
      setEditRow(null);
      setEditForm(null);
      await onRefresh?.();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {byCandidate.length > 0 && (
        <motion.div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-3">
            Applications per candidate
          </p>
          <div className="flex flex-wrap gap-2">
            {byCandidate.map(([email, count]) => (
              <span
                key={email}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-medium text-emerald-900"
              >
                <span className="truncate max-w-[200px]">{email}</span>
                <span className="bg-emerald-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-emerald-700" />
          <h3 className="font-semibold text-neutral-900">Log application for candidate</h3>
        </div>

        {error && !editRow && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Candidate *
            </label>
            <select
              value={form.profile_id}
              onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white"
              required
            >
              <option value="">Select profile…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.email}
                  {p.full_name ? ` (${p.full_name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Company *
            </label>
            <input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="Google"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Job title *
            </label>
            <input
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="Software Engineer"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Location
            </label>
            <input
              value={form.job_location}
              onChange={(e) => setForm({ ...form, job_location: e.target.value })}
              placeholder="Remote"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Job URL
            </label>
            <input
              value={form.application_url}
              onChange={(e) => setForm({ ...form, application_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Notes (visible to candidate)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm resize-none"
              placeholder="Optional update for the dashboard…"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add application"}
        </button>
      </form>

      {editRow && editForm && (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 space-y-3"
        >
          <p className="text-sm font-semibold text-neutral-900">
            Edit: {editRow.job_title} @ {editRow.company_name}
          </p>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={editForm.company_name}
              onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              placeholder="Company"
            />
            <input
              value={editForm.job_title}
              onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              placeholder="Job title"
            />
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              value={editForm.job_location}
              onChange={(e) => setEditForm({ ...editForm, job_location: e.target.value })}
              className="px-3 py-2 rounded-lg border border-neutral-200 text-sm"
              placeholder="Location"
            />
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={2}
              className="sm:col-span-2 w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm resize-none"
              placeholder="Notes"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditRow(null);
                setEditForm(null);
                setError(null);
              }}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataTable
        empty="No applications yet. Log one above for a candidate."
        onDelete={onDelete}
        onEdit={openEdit}
        columns={[
          { key: "job_title", label: "Role" },
          { key: "company_name", label: "Company" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span className="capitalize">{String(r.status || "").replace("_", " ")}</span>
            ),
          },
          {
            key: "email",
            label: "Candidate",
            render: (r) => r.profiles?.email || r.profile_id,
          },
          { key: "created_at", label: "Logged", render: (r) => formatDate(r.created_at) },
        ]}
        rows={applications}
      />
    </div>
  );
}
