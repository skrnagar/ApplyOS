import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Send password reset link to the user via Resend. */
export async function sendPasswordResetEmail({ to, resetLink }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const from =
    process.env.RESEND_FROM?.trim() || "HireOrbital <onboarding@resend.dev>";

  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#171717;max-width:480px">
    <h2 style="margin:0 0 12px;font-size:20px">Reset your HireOrbital password</h2>
    <p style="margin:0 0 20px;color:#525252">We received a request to reset the password for your account. Click the button below to choose a new password.</p>
    <p style="margin:0 0 24px">
      <a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Reset password</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#737373">Or copy this link:</p>
    <p style="margin:0 0 20px;font-size:12px;word-break:break-all;color:#525252">${escapeHtml(resetLink)}</p>
    <p style="margin:0;font-size:12px;color:#a3a3a3">If you did not request this, you can ignore this email. The link expires after a short time.</p>
  </div>`;

  const text = `Reset your HireOrbital password:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your HireOrbital password",
        html,
        text,
        tags: [{ name: "type", value: "password_reset" }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("sendPasswordResetEmail Resend:", res.status, err);
      return { sent: false, error: err };
    }

    return { sent: true };
  } catch (err) {
    console.error("sendPasswordResetEmail:", err);
    return { sent: false, error: err?.message || "Send failed" };
  }
}
