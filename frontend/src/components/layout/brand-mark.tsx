import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

/**
 * NEXHIRE AI brand mark — a stylized "N" inside a gradient chevron.
 * Pure SVG so it scales crisply and respects currentColor for accents.
 */
export function BrandMark({
  className,
  size = 32,
  withWordmark = true,
}: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="nx-grad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0" stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--chart-5))" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#nx-grad)" />
        <path
          d="M14 34V14h4.2l11.6 13.2V14H34v20h-4.2L18.2 20.8V34H14Z"
          fill="white"
        />
      </svg>
      {withWordmark ? (
        <span className="text-lg font-bold tracking-tight">
          NEXHIRE<span className="text-primary"> AI</span>
        </span>
      ) : null}
    </span>
  );
}
