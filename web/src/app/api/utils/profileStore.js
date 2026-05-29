import { isNeonDatabaseConfigured } from "./dbConfig.js";
import sql from "./sql.js";
import { getOrCreateUser } from "./getUser.js";
import { resolveRequestProfile } from "./supabaseUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";

import { mergeApplicationProfile, normalizeApplicationProfile } from "@/utils/applicationProfile";
import {
  mergeJobPreferences,
  normalizeJobPreferences,
} from "@/utils/jobPreferences";

const PROFILE_FIELDS = [
  "full_name",
  "phone",
  "profile_image",
  "current_title",
  "current_company",
  "years_of_experience",
  "location",
  "linkedin_url",
  "github_url",
  "portfolio_url",
  "bio",
];

function mapProfileResponse(profile) {
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    profile_image: profile.profile_image,
    current_title: profile.current_title,
    current_company: profile.current_company,
    years_of_experience: profile.years_of_experience,
    location: profile.location,
    linkedin_url: profile.linkedin_url,
    github_url: profile.github_url,
    portfolio_url: profile.portfolio_url,
    bio: profile.bio,
    onboarding_completed: profile.onboarding_completed,
    application_profile: normalizeApplicationProfile(profile.application_profile),
  };
}

export async function getProfileForRequest(request) {
  const user = await getOrCreateUser(request);
  if (!user) return { error: "Unauthorized", status: 401 };

  if (user._neonLinked && isNeonDatabaseConfigured()) {
    return { data: user };
  }

  if (isSupabaseAdminConfigured()) {
    const profile = await resolveRequestProfile(request);
    if (!profile) return { error: "Unauthorized", status: 401 };
    return {
      data: mapProfileResponse(profile),
    };
  }

  return { data: user };
}

export async function updateProfileForRequest(request, body) {
  const user = await getOrCreateUser(request);
  if (!user) return { error: "Unauthorized", status: 401 };

  if (user._neonLinked && isNeonDatabaseConfigured()) {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    PROFILE_FIELDS.forEach((f) => {
      if (body[f] !== undefined) {
        updates.push(`${f} = $${paramIndex++}`);
        values.push(body[f]);
      }
    });
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    if (updates.length === 1) return { error: "No fields to update", status: 400 };
    values.push(user.id);
    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0) return { error: "User not found", status: 404 };
    return { data: result[0] };
  }

  if (!isSupabaseAdminConfigured()) {
    return { error: "Profile storage not configured", status: 503 };
  }

  const profile = await resolveRequestProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const patch = {};
  PROFILE_FIELDS.forEach((f) => {
    if (body[f] !== undefined) patch[f] = body[f];
  });
  if (body.application_profile !== undefined) {
    patch.application_profile = mergeApplicationProfile(
      profile.application_profile,
      body.application_profile,
    );
  }
  if (Object.keys(patch).length === 0) {
    return { error: "No fields to update", status: 400 };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) {
    console.error("updateProfileForRequest:", error);
    return { error: "Failed to save profile", status: 500 };
  }

  return {
    data: mapProfileResponse(data),
  };
}

export async function getPreferencesForRequest(request) {
  const user = await getOrCreateUser(request);
  if (!user) return { error: "Unauthorized", status: 401 };

  if (user._neonLinked && isNeonDatabaseConfigured()) {
    const prefs =
      await sql`SELECT * FROM job_preferences WHERE user_id = ${user.id}`;
    return { data: prefs.length > 0 ? prefs[0] : null };
  }

  if (!isSupabaseAdminConfigured()) {
    return { data: null };
  }

  const profile = await resolveRequestProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const prefs = profile.job_preferences;
  if (!prefs || Object.keys(prefs).length === 0) {
    return { data: null };
  }
  return { data: normalizeJobPreferences(prefs) };
}

export async function savePreferencesForRequest(request, body) {
  const user = await getOrCreateUser(request);
  if (!user) return { error: "Unauthorized", status: 401 };

  if (user._neonLinked && isNeonDatabaseConfigured()) {
    const userId = user.id;
    const existing =
      await sql`SELECT id FROM job_preferences WHERE user_id = ${userId}`;
    const {
      target_roles,
      preferred_locations,
      work_mode,
      min_salary,
      max_salary,
      currency,
      notice_period,
      preferred_industries,
      company_size,
      visa_sponsorship,
      willing_to_relocate,
      additional_notes,
    } = body;

    if (existing.length > 0) {
      const result = await sql`
        UPDATE job_preferences SET
          target_roles = ${target_roles || []}, preferred_locations = ${preferred_locations || []},
          work_mode = ${work_mode || []}, min_salary = ${min_salary || null}, max_salary = ${max_salary || null},
          currency = ${currency || "USD"}, notice_period = ${notice_period || null},
          preferred_industries = ${preferred_industries || []}, company_size = ${company_size || []},
          visa_sponsorship = ${visa_sponsorship || false}, willing_to_relocate = ${willing_to_relocate || false},
          additional_notes = ${additional_notes || null}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} RETURNING *
      `;
      return { data: result[0] };
    }

    const result = await sql`
      INSERT INTO job_preferences (user_id, target_roles, preferred_locations, work_mode, min_salary, max_salary, currency, notice_period, preferred_industries, company_size, visa_sponsorship, willing_to_relocate, additional_notes)
      VALUES (${userId}, ${target_roles || []}, ${preferred_locations || []}, ${work_mode || []}, ${min_salary || null}, ${max_salary || null}, ${currency || "USD"}, ${notice_period || null}, ${preferred_industries || []}, ${company_size || []}, ${visa_sponsorship || false}, ${willing_to_relocate || false}, ${additional_notes || null})
      RETURNING *
    `;
    return { data: result[0], status: 201 };
  }

  if (!isSupabaseAdminConfigured()) {
    return { error: "Preferences storage not configured", status: 503 };
  }

  const profile = await resolveRequestProfile(request);
  if (!profile) return { error: "Unauthorized", status: 401 };

  const merged = mergeJobPreferences(profile.job_preferences, body);

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .update({ job_preferences: merged })
    .eq("id", profile.id)
    .select("job_preferences")
    .single();

  if (error) {
    console.error("savePreferencesForRequest:", error);
    return { error: "Failed to save preferences", status: 500 };
  }

  return { data: normalizeJobPreferences(data.job_preferences) };
}
