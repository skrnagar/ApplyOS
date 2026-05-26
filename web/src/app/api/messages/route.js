import sql from "../utils/sql.js";
import { getOrCreateUser } from "../utils/getUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../utils/supabaseUser.js";
import { notifyUserChat } from "../utils/notifyTeam.js";

function mapChatRow(row) {
  return {
    id: row.id,
    user_id: row.profile_id,
    profile_id: row.profile_id,
    sender_type: row.sender_type,
    content: row.content,
    created_at: row.created_at,
  };
}

export async function GET(request) {
  try {
    if (isSupabaseAdminConfigured()) {
      const profile = await resolveRequestProfile(request);
      if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("chat_messages")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      return Response.json((data || []).map(mapChatRow));
    }

    const user = await getOrCreateUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const messages = await sql`
      SELECT m.*, a.name as assistant_name, a.avatar as assistant_avatar
      FROM messages m LEFT JOIN assistants a ON m.assistant_id = a.id
      WHERE m.user_id = ${user.id} ORDER BY m.created_at ASC LIMIT 100
    `;
    return Response.json(messages);
  } catch (error) {
    console.error("GET /api/messages:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content } = body;
    if (!content?.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    if (isSupabaseAdminConfigured()) {
      const profile = await resolveRequestProfile(request);
      if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("chat_messages")
        .insert({
          profile_id: profile.id,
          sender_type: "user",
          content: content.trim(),
        })
        .select("*")
        .single();

      if (error) throw error;
      void notifyUserChat({
        userEmail: profile.email,
        userName: profile.full_name,
        content: content.trim(),
      });
      return Response.json(mapChatRow(data), { status: 201 });
    }

    const user = await getOrCreateUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const result = await sql`
      INSERT INTO messages (user_id, assistant_id, sender_type, content)
      VALUES (${user.id}, ${user.assigned_assistant_id || null}, 'user', ${content})
      RETURNING *
    `;
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/messages:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
