"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { hydrateFromStorage } from "@/store/authSlice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <>{children}</>;
}