import sql from "./sql.js";
import { isNeonDatabaseConfigured } from "./dbConfig.js";
import { getOrCreateUser } from "./getUser.js";
import { resolveRequestProfile } from "./supabaseUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";

function mapSupabaseRow(row) {
  return {
    ...row,
    user_id: row.profile_id,
    applied_date: row.applied_date || row.created_at,
  };
}

async function requireProfile(request) {
  if (!isSupabaseAdminConfigured()) return null;
  return resolveRequestProfile(request);
}

export async function listApplications(request, { status } = {}) {
  if (isNeonDatabaseConfigured()) {
    const user = await getOrCreateUser(request);
    if (!user?._neonLinked) return { error: "Unauthorized", status: 401 };
    const userId = user.id;
    if (status) {
      const rows =
        await sql`SELECT * FROM applications WHERE user_id = ${userId} AND status = ${status} ORDER BY created_at DESC`;
      return { data: rows };
    }
    const rows =
      await sql`SELECT * FROM applications WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return { data: rows };
  }

  const profile = await requireProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const admin = getSupabaseAdmin();
  let query = admin
    .from("applications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("listApplications supabase:", error);
    return { error: "Internal server error", status: 500 };
  }
  return { data: (data || []).map(mapSupabaseRow) };
}

export async function createApplication(request, body) {
  if (isNeonDatabaseConfigured()) {
    const user = await getOrCreateUser(request);
    if (!user?._neonLinked) return { error: "Unauthorized", status: 401 };
    const userId = user.id;
    const result = await sql`
      INSERT INTO applications (user_id, job_id, company_name, job_title, job_location, company_logo, status, cover_letter, notes, source, application_url)
      VALUES (${userId}, ${body.job_id || null}, ${body.company_name}, ${body.job_title}, ${body.job_location || null},
              ${body.company_logo || null}, ${body.status || "applied"}, ${body.cover_letter || null},
              ${body.notes || null}, ${body.source || null}, ${body.application_url || null})
      RETURNING *
    `;
    return { data: result[0], status: 201 };
  }

  const profile = await requireProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("applications")
    .insert({
      profile_id: profile.id,
      job_id: body.job_id || null,
      company_name: body.company_name,
      job_title: body.job_title,
      job_location: body.job_location || null,
      company_logo: body.company_logo || null,
      status: body.status || "applied",
      cover_letter: body.cover_letter || null,
      notes: body.notes || null,
      source: body.source || null,
      application_url: body.application_url || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createApplication supabase:", error);
    return { error: error.message || "Internal server error", status: 500 };
  }
  return { data: mapSupabaseRow(data), status: 201 };
}

export async function updateApplication(request, id, body) {
  const allowedFields = [
    "status",
    "notes",
    "interview_date",
    "interview_type",
    "interview_notes",
    "offer_amount",
    "offer_currency",
    "rejection_reason",
    "position",
  ];

  if (isNeonDatabaseConfigured()) {
    const user = await getOrCreateUser(request);
    if (!user?._neonLinked) return { error: "Unauthorized", status: 401 };

    const updates = [];
    const values = [];
    let paramIndex = 1;
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    });
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    if (updates.length === 1) return { error: "No fields to update", status: 400 };
    values.push(id);
    values.push(user.id);
    const updateQuery = `UPDATE applications SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0) return { error: "Application not found", status: 404 };
    return { data: result[0] };
  }

  const profile = await requireProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const patch = {};
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) patch[field] = body[field];
  });
  if (Object.keys(patch).length === 0) return { error: "No fields to update", status: 400 };

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("applications")
    .update(patch)
    .eq("id", id)
    .eq("profile_id", profile.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("updateApplication supabase:", error);
    return { error: "Internal server error", status: 500 };
  }
  if (!data) return { error: "Application not found", status: 404 };
  return { data: mapSupabaseRow(data) };
}

export async function deleteApplication(request, id) {
  if (isNeonDatabaseConfigured()) {
    const user = await getOrCreateUser(request);
    if (!user?._neonLinked) return { error: "Unauthorized", status: 401 };
    const result =
      await sql`DELETE FROM applications WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0) return { error: "Application not found", status: 404 };
    return { success: true };
  }

  const profile = await requireProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("profile_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("deleteApplication supabase:", error);
    return { error: "Internal server error", status: 500 };
  }
  if (!data) return { error: "Application not found", status: 404 };
  return { success: true };
}

export async function getDashboardStatsForUser(request, user) {
  if (isNeonDatabaseConfigured() && user._neonLinked) {
    const userId = user.id;
    const [totalApps] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId}`;
    const [interviews] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'interview'`;
    const [offers] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'offer'`;
    const [rejections] =
      await sql`SELECT COUNT(*)::int as count FROM applications WHERE user_id = ${userId} AND status = 'rejected'`;
    const recentApplications =
      await sql`SELECT * FROM applications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`;
    const upcomingInterviews = await sql`
      SELECT * FROM applications WHERE user_id = ${userId} AND status = 'interview' AND interview_date >= CURRENT_TIMESTAMP
      ORDER BY interview_date ASC LIMIT 3
    `;
    return {
      stats: {
        totalApplications: totalApps.count,
        interviews: interviews.count,
        offers: offers.count,
        rejections: rejections.count,
        responseRate:
          totalApps.count > 0
            ? Math.round(((interviews.count + offers.count) / totalApps.count) * 100)
            : 0,
      },
      recentApplications,
      upcomingInterviews,
    };
  }

  const profile = await requireProfile(request);
  if (!profile) return null;

  const admin = getSupabaseAdmin();
  const { data: all, error } = await admin
    .from("applications")
    .select("*")
    .eq("profile_id", profile.id);

  if (error) {
    console.error("getDashboardStatsForUser:", error);
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
    };
  }

  const apps = (all || []).map(mapSupabaseRow);
  const total = apps.length;
  const interviews = apps.filter((a) => a.status === "interview").length;
  const offers = apps.filter((a) => a.status === "offer").length;
  const rejections = apps.filter((a) => a.status === "rejected").length;
  const now = Date.now();
  const recentApplications = [...apps]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  const upcomingInterviews = apps
    .filter(
      (a) =>
        a.status === "interview" &&
        a.interview_date &&
        new Date(a.interview_date).getTime() >= now,
    )
    .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))
    .slice(0, 3);

  return {
    stats: {
      totalApplications: total,
      interviews,
      offers,
      rejections,
      responseRate: total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0,
    },
    recentApplications,
    upcomingInterviews,
  };
}
