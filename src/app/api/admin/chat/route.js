import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

/** GET /api/admin/chat?profileId= — thread for one user; omit for inbox list */
export async function GET(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error, hint: auth.hint }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const admin = getSupabaseAdmin();

  if (!profileId) {
    const { data: messages, error } = await admin
      .from("chat_messages")
      .select("id, profile_id, sender_type, content, created_at, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const threadsMap = new Map();
    for (const msg of messages || []) {
      const pid = msg.profile_id;
      if (!threadsMap.has(pid)) {
        threadsMap.set(pid, {
          profile_id: pid,
          email: msg.profiles?.email || pid,
          full_name: msg.profiles?.full_name,
          last_message: msg.content,
          last_at: msg.created_at,
          last_sender: msg.sender_type,
          unread: msg.sender_type === "user",
        });
      } else {
        const t = threadsMap.get(pid);
        if (msg.sender_type === "user" && new Date(msg.created_at) > new Date(t.last_at)) {
          t.unread = true;
        }
      }
    }

    const threads = Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.last_at) - new Date(a.last_at),
    );

    return Response.json({ threads });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", profileId)
    .maybeSingle();

  const { data: messages, error } = await admin
    .from("chat_messages")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile, messages: messages || [] });
}

/** POST /api/admin/chat — reply as assistant */
export async function POST(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error, hint: auth.hint }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { profileId, content } = body;
  if (!profileId || !content?.trim()) {
    return Response.json({ error: "profileId and content required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("chat_messages")
    .insert({
      profile_id: profileId,
      sender_type: "assistant",
      content: content.trim(),
    })
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: data }, { status: 201 });
}
