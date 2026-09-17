import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import { AppGate } from "@/components/AppGate";
import "./globals.css";

const brand = Nunito({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WFC — Work together",
  description:
    "Find people to work with, places to work, and events to join.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WFC",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f3ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${brand.variable} ${body.variable} h-full`}>
      <body className="min-h-full bg-bg antialiased">
        <AppGate>{children}</AppGate>
      </body>
    </html>
  );
}
