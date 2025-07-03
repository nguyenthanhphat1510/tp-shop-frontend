import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "TpShop - Cửa hàng điện thoại",
  description: "Cửa hàng điện thoại và phụ kiện công nghệ chính hãng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning={true}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
