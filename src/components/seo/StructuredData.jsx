import {
  getFaqPageJsonLd,
  getOrganizationJsonLd,
  getServiceJsonLd,
  getSoftwareApplicationJsonLd,
  getWebSiteJsonLd,
} from "@/utils/seo";

/** JSON-LD in document head (Organization + WebSite + product; FAQ on homepage only). */
export default function StructuredData({ pathname = "/" }) {
  const graphs = [getOrganizationJsonLd(), getWebSiteJsonLd(), getSoftwareApplicationJsonLd()];
  if (pathname === "/" || pathname === "") {
    graphs.push(getServiceJsonLd(), getFaqPageJsonLd());
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
