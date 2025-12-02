"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Topbar from "./Topbar";
import AuthProvider from "./AuthProvider";
import AuthDebug from "./AuthDebug";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

  return (
    <AuthProvider>
      {isAuthPage ? (
        children
      ) : (
        <div className="min-h-screen relative overflow-hidden">
          <div className="relative z-10">
            <Topbar />
            <main className="w-full bg-[#F5FDF8] pt-0">{children}</main>
            <Footer />
          </div>
          <AuthDebug />
        </div>
      )}
    </AuthProvider>
  );
}
