import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartDrawer, Header } from "@/components/Header";
import { Footer, WhatsAppFab } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Fulwari · Plant growers in Anand, Gujarat", template: "%s · Fulwari" },
  description: "Watch a tree grow from seed in 3D, then order it. Fulwari grows shade trees, palms, fruit trees and flowering shrubs in Anand, delivering across Gujarat and supplying industry across India.",
  openGraph: { title: "Fulwari · Plant growers in Anand", description: "Grown in Anand since 2014. Shop plants for Gujarat, or get a bulk quote for India.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#07140d", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org", "@type": "GardenStore", name: "Fulwari", telephone: SITE.phoneRaw, email: SITE.email,
  address: { "@type": "PostalAddress", streetAddress: "NH48, near HTC Foodland, Mogar", addressLocality: "Anand", addressRegion: "Gujarat", addressCountry: "IN" },
  openingHours: "Mo-Su 08:00-18:00", foundingDate: "2014", areaServed: "IN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Static previews may be served as /index.html; normalise so the router sees "/" */}
        <script dangerouslySetInnerHTML={{ __html: `if(/\\/index\\.html$/.test(location.pathname)){history.replaceState(null,'',location.pathname.replace(/index\\.html$/,'')+location.search+location.hash)}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..700,50&family=Manrope:wght@400;500;600;700;800&family=Mukta:wght@400;600;700&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
