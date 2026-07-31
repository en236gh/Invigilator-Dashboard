import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UNZA Invigilator Dashboard",
    template: "%s · UNZA Invigilator",
  },
  description:
    "University of Zambia digital examination attendance invigilator workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-ink antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
