import {
  SITE_NAME,
  WHATSAPP_DISPLAY,
  WHATSAPP_HOURS,
  WHATSAPP_NUMBER,
} from "@/config/site";
//

/** True when a usable business number is configured. */
export function isWhatsAppConfigured() {
  return WHATSAPP_NUMBER.length >= 8 && WHATSAPP_NUMBER.length <= 15;
}

/** Pretty number for display — falls back to the raw digits with a `+`. */
export function whatsAppDisplayNumber() {
  if (WHATSAPP_DISPLAY) return WHATSAPP_DISPLAY;
  return WHATSAPP_NUMBER ? `+${WHATSAPP_NUMBER}` : "";
}

/**
 * Current hour + weekday in the support time zone, without pulling in a date lib.
 * Falls back to local time if the runtime lacks full ICU data.
 */
function nowInSupportZone() {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: WHATSAPP_HOURS.timeZone,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const hour = Number(parts.find((p) => p.type === "hour")?.value);
    const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      weekday ?? "",
    );
    if (dayIndex === -1 || Number.isNaN(hour)) throw new Error("unparsable");
    // Intl renders midnight as 24 in some engines.
    return { day: dayIndex, hour: hour % 24 };
  } catch {
    return { day: now.getDay(), hour: now.getHours() };
  }
}

/** Whether the support team is inside its published hours right now. */
export function isSupportOnline() {
  const { day, hour } = nowInSupportZone();
  if (!WHATSAPP_HOURS.days.includes(day)) return false;
  return hour >= WHATSAPP_HOURS.startHour && hour < WHATSAPP_HOURS.endHour;
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${suffix}`;
}

/** e.g. "Mon–Sat, 10 AM–7 PM IST" */
export function supportHoursLabel() {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [...WHATSAPP_HOURS.days].sort((a, b) => a - b);
  const contiguous =
    days.length > 1 && days[days.length - 1] - days[0] === days.length - 1;
  const dayLabel = contiguous
    ? `${names[days[0]]}–${names[days[days.length - 1]]}`
    : days.map((d) => names[d]).join(", ");

  return `${dayLabel}, ${formatHour(WHATSAPP_HOURS.startHour)}–${formatHour(
    WHATSAPP_HOURS.endHour,
  )} ${WHATSAPP_HOURS.timeZoneLabel}`;
}

/**
 * WhatsApp caps the prefilled text; keep well under it so long pasted
 * messages still open the chat instead of erroring.
 */
const MAX_MESSAGE_LENGTH = 900;

/** Builds a wa.me deep link with the message prefilled. */
export function buildWhatsAppUrl(message, { context } = {}) {
  const body = String(message || "").trim().slice(0, MAX_MESSAGE_LENGTH);
  const lines = [body || `Hi ${SITE_NAME} team, I'd like to know more.`];
  if (context) lines.push("", `— sent from ${context}`);

  // Built by hand rather than via URLSearchParams: that encodes spaces as `+`,
  // which WhatsApp renders literally in the prefilled message.
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;
}

/** Conversation starters shown as one-tap chips in the widget. */
export const WHATSAPP_TOPICS = [
  {
    id: "pricing",
    label: "Pricing & plans",
    message: `Hi ${SITE_NAME} team, I'd like to understand your pricing and which plan fits me.`,
  },
  {
    id: "how-it-works",
    label: "How it works",
    message: `Hi ${SITE_NAME} team, can you walk me through how the application service works?`,
  },
  {
    id: "resume",
    label: "Resume review",
    message: `Hi ${SITE_NAME} team, I'd like a review of my resume and ATS score.`,
  },
  {
    id: "demo",
    label: "Talk to a human",
    message: `Hi ${SITE_NAME} team, I'd like to speak with someone about my job search.`,
  },
];
