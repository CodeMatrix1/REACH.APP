import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});


export const metadata = {
  title: "R.E.A.C.H.",
  description: "Rapid Emergency Access Care and Help",
  icons: {
    icon: "/app/reach_logo.png",
    apple: "/app/reach_logo.png",
    shortcut: "/app/reach_logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${geistSans.variable} ${geistMono.variable} ${montserrat.className}`}>
        {children}
      </body>
    </html>
  );
}
