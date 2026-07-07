import { buildSitemapXml } from "@/utils/seo";

/** GET /api/sitemap — dynamic sitemap (same URLs as public/sitemap.xml). */
export async function GET() {
  return new Response(buildSitemapXml(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
