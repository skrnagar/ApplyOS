import {
  getFaqPageJsonLd,
  getOrganizationJsonLd,
  // getServiceJsonLd, // (commented out from new SEO)
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
} from "@/utils/seo";

/** JSON-LD in document head (Organization + WebSite + product; FAQ on homepage only). */
export default function StructuredData({ pathname = "/" }) {
  const graphs = [getOrganizationJsonLd(), getWebSiteJsonLd(), getSoftwareApplicationJsonLd()];
  if (pathname === "/" || pathname === "") {
    // Current / New SEO (commented out):
    // graphs.push(getServiceJsonLd(), getFaqPageJsonLd());

    // Old SEO (restored from before commit 93aa79c):
    graphs.push(getFaqPageJsonLd());
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graphs,
        }),
      }}
    />
  );
}
