import sql from "../../utils/sql.js";
import { getOrCreateUser } from "../../utils/getUser.js";
import { isNeonDatabaseConfigured } from "../../utils/dbConfig.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../../utils/supabaseUser.js";
import { getDashboardStatsForUser } from "../../utils/applicationsStore.js";

const emptyPayload = {
  stats: {
    totalApplications: 0,
    interviews: 0,
    offers: 0,
    rejections: 0,
    responseRate: 0,
  },
  recentApplications: [],
  unreadMessages: 0,
  upcomingInterviews: [],
  user: null,
  demoStats: true,
};

async function unreadCountForProfile(request) {
  if (!isSupabaseAdminConfigured()) return 0;
  const profile = await resolveRequestProfile(request);
  if (!profile) return 0;
  const admin = getSupabaseAdmin();
  const { count, error } = await admin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("sender_type", "assistant");
  if (error) {
    console.error("dashboard stats unread:", error);
    return 0;
  }
  return count ?? 0;
}

function linkedPayload(user, extras = {}) {
  return {
    stats: {
      totalApplications: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      responseRate: 0,
    },
    recentApplications: [],
    upcomingInterviews: [],
    unreadMessages: 0,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      onboarding_completed: user.onboarding_completed,
    },
    demoStats: false,
    ...extras,
  };
}

export async function GET(request) {
  try {
    const user = await getOrCreateUser(request);
    if (!user) {
      return Response.json(emptyPayload);
    }

    const appStats = await getDashboardStatsForUser(request, user);
    const unreadMessages = await unreadCountForProfile(request);

    if (!appStats) {
      return Response.json(linkedPayload(user, { unreadMessages }));
    }

    if (!user._neonLinked || !isNeonDatabaseConfigured()) {
      return Response.json({
        ...appStats,
        unreadMessages,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          onboarding_completed: user.onboarding_completed,
        },
        demoStats: false,
      });
    }

    const userId = user.id;
    const [unreadMessagesNeon] =
      await sql`SELECT COUNT(*)::int as count FROM messages WHERE user_id = ${userId} AND is_read = false AND sender_type = 'assistant'`;

    return Response.json({
      ...appStats,
      unreadMessages: unreadMessagesNeon.count,
      user,
      demoStats: false,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
