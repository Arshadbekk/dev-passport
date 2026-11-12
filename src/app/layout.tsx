import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import ParallaxBackground from "@/components/ParallaxBackground";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

// Next.js needs an absolute base to resolve relative social-sharing URLs.
// Set NEXT_PUBLIC_SITE_URL to your deployed HTTPS domain on Vercel.
function getMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    const url = new URL(configured || "http://localhost:3000");
    if (url.protocol === "https:" || url.protocol === "http:") return url;
  } catch {
    // Fall back for a missing or malformed local environment variable.
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Dev Passport: your verified developer portfolio",
  description:
    "Turn real contributions into a shareable, verifiable developer passport. Open source, built by the Mobile Dev Connect community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <ParallaxBackground />
          <div className="relative z-10">
            <Nav />
            <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-6 focus:outline-none">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
