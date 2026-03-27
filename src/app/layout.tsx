import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SSEProvider } from "@/components/SSEProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agent Command Center",
  description: "Multi-agent development dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`} style={{ margin: 0, padding: 0, height: "100vh", overflow: "hidden" }}>
        <div style={{ display: "flex", height: "100vh", backgroundColor: "#0a0a0f", color: "#f0f0f5" }}>
          <Sidebar />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <Header />
            <SSEProvider>
              <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {children}
              </main>
            </SSEProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
