// components/SecondaryNav.tsx
import Link from "next/link";
import type { Category } from "@/types";

export default function SecondaryNav({ items }: { items: Category[] }) {
  if (!items.length) return null;
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-2 overflow-x-auto flex gap-2">
        {items.map((c) => (
          <Link
            key={c._id}
            href={`/category/${c.slug}`}
            className="whitespace-nowrap rounded-full border px-4 py-1.5 hover:bg-green-50"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
