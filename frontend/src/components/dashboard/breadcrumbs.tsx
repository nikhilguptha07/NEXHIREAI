'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname() || "";

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>

      {segments.slice(1).map((segment, index) => {
        const href =
          "/" + segments.slice(0, index + 2).join("/");

        const isLast =
          index === segments.slice(1).length - 1;

        const title = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div
            key={href}
            className="flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4" />

            {isLast ? (
              <span className="font-medium">
                {title}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground"
              >
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}