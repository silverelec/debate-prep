import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debate Prep",
  description: "AI-powered debate preparation and practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <a href="/" className="text-xl font-bold text-gray-900">
            Debate Prep
          </a>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
