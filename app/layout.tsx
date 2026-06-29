import type { Metadata } from "next";
import { Inter, Heebo, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Store",
    template: "%s | Store",
  },
  description: "Premium products, delivered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" className={`${inter.variable} ${heebo.variable} ${oswald.variable} h-full`}>
      <body className={`min-h-full flex flex-col antialiased ${heebo.variable} ${oswald.variable}`}>{children}</body>
    </html>
  );
}
