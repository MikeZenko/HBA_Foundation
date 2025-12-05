import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "High Bluff Academy Foundation | Scholarships for Afghan Students",
  description: "Discover vetted scholarships and educational opportunities for Afghan students. Find fully-funded programs, application guides, and resources to pursue your academic dreams.",
  keywords: ["scholarships", "Afghan students", "education", "fully funded", "study abroad", "HBA Foundation"],
  authors: [{ name: "High Bluff Academy Foundation" }],
  openGraph: {
    title: "High Bluff Academy Foundation",
    description: "Pathways to Global Learning for Afghan Students",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
