import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/journal", "/favorites", "/profile"] },
    sitemap: "https://wisdommode.app/sitemap.xml",
  };
}
