import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider as JotaiProvider } from "jotai";


const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Knit — Visual workflow automation",
    template: "%s · Knit",
  },
  description:
    "Build workflows on a canvas and let them run in the background. Trigger on a form response, a Stripe event, or a click, then call APIs, prompt a model, and post the result.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
         className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`} 
         >
        <TRPCReactProvider>
          <JotaiProvider>
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
          </JotaiProvider>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
