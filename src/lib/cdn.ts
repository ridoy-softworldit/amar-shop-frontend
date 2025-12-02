// src/lib/cdn.ts
export function cldFill(src: string, w: number, h: number) {
  if (!src.includes("/upload/")) return src;
  // auto format + quality + cover crop
  return src.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}/`
  );
}
