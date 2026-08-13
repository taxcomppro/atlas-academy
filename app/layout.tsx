import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://academy.taxcomppro.com"),
  title: "Atlas Academy | Learn. Apply. Advance.",
  description: "Courses, toolkits, and staff training for tax professionals—all connected to one Academy profile.",
  openGraph: { title: "Atlas Academy", description: "Learn. Apply. Advance. Training for tax professionals.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Atlas Academy", description: "Learn. Apply. Advance. Training for tax professionals.", images: ["/og.png"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
