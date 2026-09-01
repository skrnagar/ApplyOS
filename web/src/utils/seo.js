import { FAQ_ITEMS } from "@/config/faq";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  SITE_LOCALE,
} from "@/config/site";

/** Public marketing routes included in sitemap.xml */
export const SITEMAP_PATHS = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "weekly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/resume-checker", changefreq: "weekly", priority: "0.85" },
  { path: "/account/signin", changefreq: "monthly", priority: "0.5" },
  { path: "/account/signup", changefreq: "monthly", priority: "0.6" },
];

const PAGE_META = {
  "/": {
    title: `${SITE_NAME} — #1 Job Application Service `,
    description: SITE_DESCRIPTION,
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Transparent HireOrbital plans for US job seekers: application tracking, expert support, resume building tools, and interview prep to improve ATS scores. Monthly and yearly options.",
  },
  "/contact": {
    title: "Contact",
    description:
      "Talk to HireOrbital about your job search. Schedule a walkthrough, ask about plans, or send a message to our team.",
  },
  "/tools": {
    title: "Career tools & guides",
    description:
      "Free resume, LinkedIn, and interview prep guides from HireOrbital — the same frameworks we use in the product.",
  },
  "/resume-checker": {
    title: "Free ATS resume checker",
    description:
      "Upload your resume and get an instant ATS compatibility score with actionable feedback — file format, keywords, and content tips for LinkedIn, Naukri, and employer portals.",
  },
  "/resume-checker/results": {
    title: "ATS resume report",
    description: "Your HireOrbital ATS analysis with score breakdown, passed checks, warnings, and content tips.",
  },
  "/account/signin": {
    title: "Sign in",
    description: "Sign in to your HireOrbital workspace to track applications, messages, and career progress.",
  },
  "/account/signup": {
    title: "Create account",
    description:
      "Create your HireOrbital account and launch your streamlined US job search pipeline in minutes. Start applying to jobs and improving your resume today.",
  },
};

const NOINDEX_PREFIXES = [
  "/admin",
  "/dashboard",
  "/api",
  "/resume-checker/results",
  "/account/logout",
  "/account/forgot-password",
  "/account/reset-password",
  "/account/auth",
  "/errors",
  "/__create",
];

function normalizePath(pathname) {
  if (!pathname || pathname === "") return "/";
  const base = pathname.split("?")[0].split("#")[0];
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base;
}

function shouldNoindex(pathname) {
  const path = normalizePath(pathname);
  return NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function absoluteUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/**
 * Build React Router `meta()` descriptors for a page.
 */
export function buildMeta({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}) {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "theme-color", content: "#059669" },
    { name: "author", content: SITE_NAME },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: `${SITE_NAME} — job search platform` },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: SITE_LOCALE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: `${SITE_NAME} — job search platform` },
  ];
}

/** Path-based meta for the app layout (marketing + auth pages). */
export function metaForPath(pathname) {
  const path = normalizePath(pathname);
  const noindex = shouldNoindex(path);

  if (noindex) {
    return buildMeta({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path,
      noindex: true,
    });
  }

  const page = PAGE_META[path];
  if (page) {
    return buildMeta({
      title: page.title,
      description: page.description,
      path,
    });
  }

  return buildMeta({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path,
  });
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    email: "hireorbit.1@gmail.com",
    description: SITE_DESCRIPTION,
    sameAs: [],
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function getFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function getSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "100",
      highPrice: "349",
      offerCount: "4",
    },
  };
}

export function buildSitemapXml() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PATHS.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${absoluteUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
