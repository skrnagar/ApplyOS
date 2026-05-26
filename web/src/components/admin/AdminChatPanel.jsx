"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { adminFetchJson } from "@/utils/adminClient";
import { Send, User, MessageSquare } from "lucide-react";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminChatPanel({ profiles = [], initialProfileId = null }) {
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState(initialProfileId);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const loadThreads = useCallback(async () => {
    const data = await adminFetchJson("/api/admin/chat");
    setThreads(data.threads || []);
  }, []);

  const loadThread = useCallback(async (profileId) => {
    if (!profileId) {
      setMessages([]);
      setProfile(null);
      return;
    }
    const data = await adminFetchJson(`/api/admin/chat?profileId=${profileId}`);
    setProfile(data.profile);
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!initialProfileId) return;
    setSelectedId(initialProfileId);
    void (async () => {
      setLoading(true);
      try {
        await loadThread(initialProfileId);
      } finally {
        setLoading(false);
      }
    })();
  }, [initialProfileId, loadThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectProfile = async (id) => {
    setSelectedId(id);
    setLoading(true);
    try {
      await loadThread(id);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!selectedId || !reply.trim() || sending) return;
    setSending(true);
    try {
      const data = await adminFetchJson("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: selectedId, content: reply.trim() }),
      });
      setMessages((prev) => [...prev, data.message]);
      setReply("");
      await loadThreads();
    } catch (err) {
      window.alert(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const pickableProfiles =
    threads.length > 0
      ? threads
      : profiles.map((p) => ({
          profile_id: p.id,
          email: p.email,
          full_name: p.full_name,
          last_message: null,
          unread: false,
        }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[520px]">
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Conversations
          </p>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-neutral-100">
          {pickableProfiles.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">No users yet.</p>
          ) : (
            pickableProfiles.map((t) => (
              <button
                key={t.profile_id}
                type="button"
                onClick={() => selectProfile(t.profile_id)}
                className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors ${
                  selectedId === t.profile_id ? "bg-emerald-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-neutral-900 truncate">
                      {t.full_name || t.email}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{t.email}</p>
                  </div>
                  {t.unread ? (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  ) : null}
                </div>
                {t.last_message ? (
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{t.last_message}</p>
                ) : null}
              </button>
            ))
          )}
        </div>
        {profiles.length > 0 && (
          <div className="p-3 border-t border-neutral-100">
            <label className="text-xs text-neutral-500 block mb-1">Start chat with</label>
            <select
              className="w-full text-sm border border-neutral-200 rounded-lg px-2 py-2"
              value={selectedId || ""}
              onChange={(e) => selectProfile(e.target.value)}
            >
              <option value="">Select user…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white flex flex-col min-h-[520px]">
        {selectedId ? (
          <>
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <User size={18} className="text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">
                  {profile?.full_name || profile?.email || "User"}
                </p>
                <p className="text-xs text-neutral-500">{profile?.email}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px] bg-neutral-50/50">
              {loading ? (
                <p className="text-sm text-neutral-500 text-center py-8">Loading…</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No messages yet. Send the first reply below.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_type === "assistant" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        m.sender_type === "assistant"
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-neutral-200 text-neutral-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.sender_type === "assistant" ? "text-emerald-100" : "text-neutral-400"
                        }`}
                      >
                        {m.sender_type === "assistant" ? "You (admin)" : "User"} ·{" "}
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>
            <form onSubmit={sendReply} className="p-4 border-t border-neutral-100 flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply as HireOrbital assistant…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8">
            <MessageSquare size={40} className="mb-3 text-neutral-300" />
            <p className="text-sm">Select a user to view and reply to their chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
