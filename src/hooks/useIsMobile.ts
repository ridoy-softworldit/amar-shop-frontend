"use client";
import { useEffect, useState } from "react";

export function useIsMobile(bp = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width:${bp - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener?.("change", onChange);
    
    mql.addListener?.(onChange);
    return () => {
      mql.removeEventListener?.("change", onChange);
      
      mql.removeListener?.(onChange);
    };
  }, [bp]);
  return isMobile;
}
