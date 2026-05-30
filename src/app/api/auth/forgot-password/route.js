import {
  getSupabaseAdmin,
  getSupabaseServerPublic,
} from "@/utils/supabase/admin";
import { loadServerEnv } from "@/utils/loadServerEnv.js";
import { getSiteOrigin, passwordResetRedirectUrl } from "../../utils/siteOrigin.js";
import { sendPasswordResetEmail } from "../../utils/sendPasswordResetEmail.js";

loadServerEnv();

/** POST /api/auth/forgot-password — send Supabase recovery email (Resend fallback when configured). */
export async function POST(request) {
  let email;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = getSiteOrigin(request);
  const redirectTo = passwordResetRedirectUrl(origin);

  const publicClient = getSupabaseServerPublic();
  const admin = getSupabaseAdmin();
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());

  if (!publicClient && !admin) {
    return Response.json(
      {
        error: "Password reset is not configured on the server.",
        hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      },
      { status: 503 },
    );
  }

  let delivered = false;
  let channel = null;
  const warnings = [];

  // Prefer Resend + generateLink — reliable delivery when RESEND_API_KEY is set.
  if (admin && hasResend) {
    try {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

      if (error) {
        console.error("forgot-password generateLink:", error.message);
        if (error.message?.includes("User not found")) {
          warnings.push("No auth user for this email — sign up first or use the email from sign-up.");
        } else {
          warnings.push(error.message);
        }
      } else if (data?.properties?.action_link) {
        const mail = await sendPasswordResetEmail({
          to: email,
          resetLink: data.properties.action_link,
        });
        if (mail.sent) {
          delivered = true;
          channel = "resend";
        } else {
          warnings.push(mail.error || "Resend failed");
        }
      }
    } catch (err) {
      console.error("forgot-password resend path:", err);
      warnings.push(err?.message || "Resend path failed");
    }
  }

  // Supabase built-in auth email (requires SMTP or Supabase mailer in Dashboard).
  if (!delivered && publicClient) {
    const { error } = await publicClient.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      console.error("forgot-password resetPasswordForEmail:", error.message);
      warnings.push(error.message);
    } else {
      delivered = true;
      channel = channel || "supabase";
    }
  }

  // Do not reveal whether the email exists — same response either way.
  return Response.json({
    ok: true,
    delivered,
    channel,
    redirectTo,
    hint: delivered
      ? null
      : hasResend
        ? "Could not send reset email. Confirm the address is registered and check Supabase Auth users."
        : "Add RESEND_API_KEY on the server for reliable delivery, or configure SMTP under Supabase → Authentication → Email.",
    warnings: process.env.NODE_ENV === "development" ? warnings : undefined,
  });
}
