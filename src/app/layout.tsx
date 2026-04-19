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
  title: "PalmWis - Palm Reading App",
  description: "Discover your destiny written in your palm",
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
        {children}
      </body>
    </html>
  );
}