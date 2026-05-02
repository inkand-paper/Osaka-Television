import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.osakagroupbd.com'),
  title: "OSAKA GROUP | Premium Electronics & Home Appliances",
  description: "Official OSAKA GROUP website. Explore our premium range of TVs, Fans, and Cookers. Quality appliances designed for modern homes in Bangladesh.",
  icons: {
    icon: "/assets/about-osaka.jpeg",
    shortcut: "/assets/about-osaka.jpeg",
    apple: "/assets/about-osaka.jpeg",
  },
  openGraph: {
    title: "OSAKA GROUP | Premium Electronics & Home Appliances",
    description: "Official OSAKA GROUP website. Explore our premium range of TVs, Fans, and Cookers. Quality appliances designed for modern homes in Bangladesh.",
    siteName: "Osaka Group",
    images: [
      {
        url: "/assets/about-osaka.jpeg",
        width: 1200,
        height: 630,
        alt: "Osaka Group Premium Electronics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OSAKA GROUP | Premium Electronics & Home Appliances",
    description: "Official OSAKA GROUP website. Explore our premium range of TVs, <Fan></Fan>s, and Cookers. Quality appliances designed for modern homes in Bangladesh.",
    images: ["/assets/about-osaka.jpeg"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
