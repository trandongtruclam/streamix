import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "@livekit/components-styles";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Streamix",
    default: "Streamix",
  },
  description: "Livestreaming platform using Next.js",
  icons: {
    icon: "/streamix.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          storageKey="streamix-theme"
        >
          <AuthProvider>
            {children}
            <SpeedInsights />
            <Toaster theme="dark" position="bottom-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
