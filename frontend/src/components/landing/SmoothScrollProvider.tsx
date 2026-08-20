'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Skip heavy Lenis scroll ticker on dashboard routes for lightning fast navigation
    if (pathname?.startsWith('/dashboard')) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');

      if (!href) return;

      // Supports both "/#section" and "#section"
      if (href.startsWith('/#') || href.startsWith('#')) {
        const hash = href.includes('#')
          ? href.substring(href.indexOf('#'))
          : '';

        if (!hash) return;

        const element = document.querySelector(hash);

        if (!element) {
          console.warn(`Section not found: ${hash}`);
          return;
        }

        e.preventDefault();

        history.replaceState(null, '', hash);

        lenis.scrollTo(element as HTMLElement, {
          offset: -80,
          duration: 1.2,
          immediate: false,
        });

        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 300);
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}