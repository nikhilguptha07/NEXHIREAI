import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — conditional className combiner for Shadcn UI primitives.
 * Merges Tailwind classes intelligently (later wins).
 *
 * @example cn('px-2', isActive && 'bg-primary', 'px-4') // => 'bg-primary px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
