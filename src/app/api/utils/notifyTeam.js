import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

const DEFAULT_ALERT_EMAIL = "hireorbit.1@gmail.com";

export function getAlertEmail() {
  return (
    process.env.ALERT_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    DEFAULT_ALERT_EMAIL
  ).toLowerCase();
}

/**
 * Send alert to team inbox (Resend when RESEND_API_KEY is set, else log in dev).
 */
export async function notifyTeam({ subject, text, html, tags = {} }) {
  const to = getAlertEmail();
  const subjectLine = `[HireOrbital] ${subject}`;
  const bodyText = text || "";
  const bodyHtml =
    html ||
    `<div style="font-family:system-ui,sans-serif;line-height:1.5;color:#171717">
      <h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
      <pre style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(bodyText)}</pre>
      <p style="margin-top:16px;font-size:12px;color:#737373">
        <a href="${process.env.AUTH_URL || "http://localhost:4000"}/admin">Open admin dashboard</a>
      </p>
    </div>`;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[HireOrbital alert →", to + "]", subjectLine, bodyText.slice(0, 500));
    return { sent: false, logged: true, to };
  }

  try {
    const from =
      process.env.RESEND_FROM?.trim() || "HireOrbital <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: subjectLine,
        html: bodyHtml,
        text: bodyText,
        tags: Object.entries(tags).map(([name, value]) => ({ name, value: String(value) })),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("notifyTeam Resend error:", res.status, err);
      return { sent: false, error: err };
    }

    return { sent: true, to };
  } catch (err) {
    console.error("notifyTeam:", err);
    return { sent: false, error: err?.message };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyNewLead({ email, name, phone, source, metadata }) {
  return notifyTeam({
    subject: `New lead: ${email}`,
    text: `Email: ${email}\nName: ${name || "—"}\nPhone: ${phone || "—"}\nSource: ${source}\nMeta: ${JSON.stringify(metadata || {}, null, 2)}`,
    tags: { type: "lead", source },
  });
}

export async function notifyContactForm({ email, name, phone, message }) {
  return notifyTeam({
    subject: `Contact form: ${email}`,
    text: `From: ${name || "—"} <${email}>\nPhone: ${phone || "—"}\n\n${message}`,
    tags: { type: "contact" },
  });
}

export async function notifyUserChat({ userEmail, userName, content }) {
  return notifyTeam({
    subject: `User message: ${userEmail}`,
    text: `From: ${userName || userEmail}\n\n${content}`,
    tags: { type: "chat" },
  });
}

export async function notifyNewSignup({ email, name, phone }) {
  return notifyTeam({
    subject: `New signup: ${email}`,
    text: `Email: ${email}\nName: ${name || "—"}\nPhone: ${phone || "—"}`,
    tags: { type: "signup" },
  });
}

export async function notifyResumeUpload({
  email,
  userEmail,
  userName,
  fileName,
  atsScore,
}) {
  const who = userEmail || email;
  const label = userName ? `${userName} <${who}>` : who;
  return notifyTeam({
    subject: `Resume uploaded: ${who}`,
    text: `User: ${label}\nFile: ${fileName}\nATS: ${atsScore ?? "—"}`,
    tags: { type: "resume" },
  });
}

export async function notifyNewApplication({ email, company, jobTitle }) {
  return notifyTeam({
    subject: `New application: ${email}`,
    text: `User: ${email}\nRole: ${jobTitle} at ${company}`,
    tags: { type: "application" },
  });
}
