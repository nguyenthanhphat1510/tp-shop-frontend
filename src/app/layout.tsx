import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthModal from '@/components/Auth/AuthModal';
import Chatbox from '@/components/Chatbox/Chatbox';

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
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <Navbar />
          <Chatbox />
          {children}
          <AuthModal />
           {/* ✅ Toast Container */}
                    <ToastContainer
                    />
        </AuthProvider>
      </body>
    </html>
  );
}
