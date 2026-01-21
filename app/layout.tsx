import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store/provider";
import { UIProvider } from "@/contexts/ui-context";
import { ThemeProvider } from "@/components/theme-provider";
import ToastProvider from "@/contexts/toast-context";
import BetaMessage from "@/components/BetaMessage";

export const metadata: Metadata = {
  title: "JBscape",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-screen w-screen scrollbar-hide" lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ToastProvider>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <UIProvider>
                <BetaMessage />
                {children}
              </UIProvider>
            </ThemeProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
