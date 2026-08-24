import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast"
import {Providers} from './providers'
import Navbar from '@/components/Navbar'


import * as React from 'react'



const inter = Inter({subsets :  ["latin"]})


export const metadata: Metadata = {
  title: "AI Meeting Summariser ",
  description: "An ai powered application that turn meeting recordings into structured action items",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
         
            <Navbar />

            <main className="min-h-screen bg-background">
              {children}
            </main>

            <Toaster />
         
        </Providers>
      </body>
    </html>
  );
}