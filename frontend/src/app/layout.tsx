import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Court Reporting Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* 2. Taruh Toaster di sini dengan durasi global 5000ms (5 detik) */}
        <Toaster duration={5000} position="top-right" richColors />
      </body>
    </html>
  );
}
