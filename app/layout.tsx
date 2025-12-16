import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/lib/store/provider";
import { UIProvider } from "@/contexts/ui-context";
import { ThemeProvider } from "@/components/theme-provider";
import ToastProvider from "@/contexts/toast-context";
import BetaMessage from "@/components/BetaMessage";
// import { Mona_Sans } from "next/font/google"

// const monaSans = Mona_Sans({
//   subsets: ["latin"],
//   weight: "400",
//   style: "normal",
//   display: "swap",
// })

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
    <html className="h-screen w-screen scrollbar-hide" lang="en">
      <body className={`bg-linear antialiased`}>
        <ToastProvider>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
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
