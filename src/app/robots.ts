import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account", "/checkout"] },
    ],
    sitemap: "https://www.provit.site/sitemap.xml",
    host: "https://www.provit.site",
  };
}
