import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, Raleway } from "next/font/google";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://palmwis.app"),
  title: {
    default: "PalmWis - AI Palm Reading",
    template: "%s | PalmWis",
  },
  description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover what your hands reveal about your personality, career, and love life.",
  keywords: ["palm reading", "palmistry", "hand reading", "fortune telling", "AI reading"],
  authors: [{ name: "PalmWis" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://palmwis.app",
    siteName: "PalmWis",
    title: "PalmWis - AI Palm Reading",
    description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover your destiny.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmWis - AI Palm Reading",
    description: "Ancient palmistry wisdom meets AI. Upload your palm photo and discover your destiny.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzelDecorative.variable} ${cinzel.variable} ${raleway.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PalmWis",
              url: "https://palmwis.app",
              description: "AI-powered palm reading service",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}