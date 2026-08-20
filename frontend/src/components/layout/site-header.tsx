import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * Marketing/public header — shown on landing + marketing pages.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label="NEXHIRE AI home"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <BrandMark />
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main Navigation"
        >
          <Link
            href="/features"
            className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Features
          </Link>

          <Link
            href="/3d-experience"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 transition-all hover:bg-purple-500/20 hover:scale-105"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            3D Studio
          </Link>

          <Link
            href="/ai"
            className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            AI
          </Link>

          <Link
            href="/security"
            className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Security
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              Sign in
            </Link>
          </Button>

          <Button size="sm" asChild>
            <Link href="/dashboard">
              Get started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}