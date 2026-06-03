import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://wisdommode.app"),
  title: {
    default: "Wisdom Mode — A library of timeless wisdom for modern struggles",
    template: "%s · Wisdom Mode",
  },
  description:
    "Wisdom Mode is a premium digital wisdom library that helps you navigate emotional, psychological and life struggles through carefully curated, hand-written wisdom.",
  keywords: [
    "wisdom", "personal growth", "reflection", "journal", "procrastination",
    "anxiety", "confidence", "loneliness", "purpose", "discipline",
  ],
  openGraph: {
    title: "Wisdom Mode",
    description: "A library of timeless wisdom for modern struggles.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <Nav user={user ? { name: user.name, role: user.role } : null} />
        <main>{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
