import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/providers";
import ToastMessageContainer from "@/component/common/ToastMessage/ToastMessageContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "birthday-funding",
  description:
    "A birthday funding platform that allows users to create and manage birthday funding campaigns"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-canvas text-content">
        <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col bg-surface md:shadow-surface">
          <Providers>
            {children}
            <ToastMessageContainer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
