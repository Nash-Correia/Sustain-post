// components/product/ProductCard.tsx
import Link from "next/link";
import React from "react";

export default function ProductCard({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-teal-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 flex-grow">{children}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline self-start"
        >
          Explore
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}