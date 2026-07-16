import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechMart AI Support",
  description: "AI-Powered Customer Support Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
