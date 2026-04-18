import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/ui/BottomNav";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Autonomous Farm Manager",
  description: "AI-powered farming intelligence for the modern farmer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans bg-background text-foreground`} suppressHydrationWarning>
        {/* Mobile Container */}
        <div className="min-h-screen flex flex-col items-center">
          <main className="w-full max-w-[440px] flex-grow relative bg-background pb-24 min-h-screen">
            {children}
            <BottomNav />
          </main>
        </div>
      </body>
    </html>
  );
}
