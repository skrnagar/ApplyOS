import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

const STATUSES = ["applied", "under_review", "interview", "offer", "rejected"];

function mapRow(row) {
  return {
    ...row,
    user_id: row.profile_id,
    applied_date: row.applied_date || row.created_at,
  };
}

export async function POST(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error, hint: auth.hint }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { profile_id, company_name, job_title } = body;
  if (!profile_id || !company_name?.trim() || !job_title?.trim()) {
    return Response.json(
      { error: "Candidate (profile), company, and job title are required." },
      { status: 400 },
    );
  }

  const status = body.status && STATUSES.includes(body.status) ? body.status : "applied";

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", profile_id)
    .maybeSingle();

  if (!profile) {
    return Response.json({ error: "Candidate profile not found." }, { status: 404 });
  }

  const insert = {
    profile_id,
    company_name: company_name.trim(),
    job_title: job_title.trim(),
    job_location: body.job_location?.trim() || null,
    status,
    notes: body.notes?.trim() || null,
    application_url: body.application_url?.trim() || null,
    source: "hireorbital_team",
    applied_date: body.applied_date || new Date().toISOString(),
  };

  const { data, error } = await admin.from("applications").insert(insert).select("*").single();

  if (error) {
    console.error("admin create application:", error);
    return Response.json({ error: error.message || "Insert failed" }, { status: 500 });
  }

  return Response.json({ application: mapRow(data), candidate_email: profile.email }, { status: 201 });
}

export async function PATCH(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error, hint: auth.hint }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body;
  if (!id) return Response.json({ error: "Application id is required." }, { status: 400 });

  const allowed = [
    "company_name",
    "job_title",
    "job_location",
    "status",
    "notes",
    "application_url",
    "applied_date",
    "interview_date",
    "interview_type",
    "interview_notes",
  ];

  const patch = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "status" && body[key] && !STATUSES.includes(body[key])) continue;
      patch[key] = typeof body[key] === "string" ? body[key].trim() || null : body[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No fields to update." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("admin update application:", error);
    return Response.json({ error: error.message || "Update failed" }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Application not found." }, { status: 404 });

  return Response.json({ application: mapRow(data) });
}
