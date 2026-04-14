import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venture Signal",
  description: "Deal flow intelligence for focused investors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
