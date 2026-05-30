import { resolveRequestProfile } from "../../utils/supabaseUser.js";
import { userFromSupabaseProfile } from "../../utils/getUser.js";
import { notifyNewSignup } from "../../utils/notifyTeam.js";

/** POST /api/auth/sync — link Supabase Auth user to public.profiles */
export async function POST(request) {
  try {
    const profile = await resolveRequestProfile(request);
    if (!profile) {
      return Response.json(
        { ok: false, error: "Not authenticated or Supabase admin not configured" },
        { status: 401 },
      );
    }
    const user = userFromSupabaseProfile(profile);
    const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : 0;
    if (createdAt && Date.now() - createdAt < 120_000) {
      void notifyNewSignup({
        email: profile.email,
        name: profile.full_name,
      });
    }
    return Response.json({
      ok: true,
      linked: true,
      profile,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/sync:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
