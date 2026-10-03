import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import StoreProvider from "@/hooks/RootHooks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicLens",
  description: "Civic accountability cases tracking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Top Navigation Bar */}
            <Header />
            
            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-slate-50 relative overflow-y-auto">
              <div className="w-full">
                {children}
              </div>
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
