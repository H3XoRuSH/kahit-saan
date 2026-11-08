import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  variable: "--font-mono-departure",
  display: "swap",
});

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
    <html lang="en" className={`${departureMono.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
