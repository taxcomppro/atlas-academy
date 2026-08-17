import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./session-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"),
  title: "Atlas Academy | Learn. Apply. Advance.",
  description:
    "Courses, toolkits, and staff training for tax professionals—all connected to one Academy profile.",
  openGraph: {
    title: "Atlas Academy",
    description: "Learn. Apply. Advance. Training for tax professionals.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Academy",
    description: "Learn. Apply. Advance. Training for tax professionals.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
