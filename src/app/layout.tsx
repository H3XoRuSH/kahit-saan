import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], weight: ["500", "600", "700"] });
const jb = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Kahit Saan - Main Menu",
  description: "The anti-indecision group decider.",
  icons: {
    icon: [
      { url: "/icons/tab-icon.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/icons/tab-icon.png",
    apple: "/icons/tab-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFDF7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${space.variable} ${jb.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
