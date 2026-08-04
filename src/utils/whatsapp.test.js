import { afterEach, describe, expect, it, vi } from "vitest";

// Hermetic config so these tests don't depend on whatever .env is present.
vi.mock("@/config/site", () => ({
  SITE_NAME: "HireOrbital",
  WHATSAPP_NUMBER: "919131458995",
  WHATSAPP_DISPLAY: "+91 91314 58995",
  WHATSAPP_HOURS: {
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    days: [1, 2, 3, 4, 5, 6],
    startHour: 10,
    endHour: 19,
  },
}));

const {
  buildWhatsAppUrl,
  isSupportOnline,
  isWhatsAppConfigured,
  supportHoursLabel,
  whatsAppDisplayNumber,
} = await import("./whatsapp.js");

afterEach(() => {
  vi.useRealTimers();
});

describe("buildWhatsAppUrl", () => {
  it("targets wa.me with the configured number", () => {
    expect(buildWhatsAppUrl("hi")).toContain("https://wa.me/919131458995?text=");
  });

  it("percent-encodes spaces rather than using '+'", () => {
    // URLSearchParams would emit "hello+there", which WhatsApp shows literally.
    const url = buildWhatsAppUrl("hello there");
    expect(url).toContain("hello%20there");
    expect(url).not.toContain("+there");
  });

  it("encodes newlines and appends the context line", () => {
    const url = buildWhatsAppUrl("question", { context: "the home page" });
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toBe("question\n\n— sent from the home page");
  });

  it("falls back to a default message when empty", () => {
    const text = decodeURIComponent(buildWhatsAppUrl("   ").split("?text=")[1]);
    expect(text).toContain("HireOrbital");
  });

  it("truncates very long messages so the deep link still opens", () => {
    const url = buildWhatsAppUrl("x".repeat(5000));
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toHaveLength(900);
  });
});

describe("configuration", () => {
  it("accepts a valid 12-digit number", () => {
    expect(isWhatsAppConfigured()).toBe(true);
  });

  it("prefers the human-readable display label", () => {
    expect(whatsAppDisplayNumber()).toBe("+91 91314 58995");
  });
});

describe("support hours", () => {
  it("renders a contiguous day range", () => {
    expect(supportHoursLabel()).toBe("Mon–Sat, 10 AM–7 PM IST");
  });

  it("is online at 11:30 IST on a weekday", () => {
    vi.useFakeTimers();
    // 06:00Z == 11:30 IST, Wednesday 5 Aug 2026.
    vi.setSystemTime(new Date("2026-08-05T06:00:00Z"));
    expect(isSupportOnline()).toBe(true);
  });

  it("is offline at 21:30 IST on a weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-05T16:00:00Z"));
    expect(isSupportOnline()).toBe(false);
  });

  it("is offline on Sunday even during business hours", () => {
    vi.useFakeTimers();
    // 2 Aug 2026 is a Sunday; 06:00Z == 11:30 IST.
    vi.setSystemTime(new Date("2026-08-02T06:00:00Z"));
    expect(isSupportOnline()).toBe(false);
  });

  it("treats the end hour as exclusive (19:30 IST is closed)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-05T14:00:00Z"));
    expect(isSupportOnline()).toBe(false);
  });
});
