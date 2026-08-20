'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CalendarDays,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Sliders,
  MessageSquare,
  Plus,
  FileText,
  ShieldAlert,
  Building2,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/layout/brand-mark';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

interface NavSubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  recruiterOnlySubItems?: NavSubItem[];
  adminOnlySubItems?: NavSubItem[];
  subItems?: NavSubItem[];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Candidates', href: '/dashboard/candidates', icon: Users },
  {
    label: 'Jobs',
    href: '/dashboard/jobs',
    icon: Briefcase,
    recruiterOnlySubItems: [
      { label: 'Create Job', href: '/dashboard/jobs/new', icon: Plus },
    ],
  },
  { label: 'Applications', href: '/dashboard/applications', icon: FileText },
  { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
  { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  {
    label: 'AI Tools',
    href: '/dashboard/ai',
    icon: Sparkles,
    subItems: [
      { label: 'Resume Scanner', href: '/dashboard/ai/resume-scanner', icon: FileSearch },
      { label: 'Candidate Ranking', href: '/dashboard/ai/resume-ranking', icon: Sliders },
      { label: 'AI Assistant', href: '/dashboard/ai/chat', icon: MessageSquare },
    ],
  },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: ShieldAlert,
    adminOnly: true,
    subItems: [
      { label: 'Companies', href: '/admin/companies', icon: Building2 },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    ],
  },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN') ||
    user?.roles?.includes('ADMIN')
  );

  const isAdmin = Boolean(
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN') ||
    user?.roles?.includes('ADMIN')
  );

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-300 z-30 select-none h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand & Header — Single Logo & Title */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <BrandMark size={28} withWordmark={false} />
          {!collapsed && (
            <span className="font-bold text-base tracking-tight text-foreground">
              NEXHIRE<span className="text-primary"> AI</span>
            </span>
          )}
        </Link>

        <button
          onClick={onToggle}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-border/50 bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          const visibleSubItems = [
            ...(item.subItems || []),
            ...(isRecruiter ? item.recruiterOnlySubItems || [] : []),
          ];

          return (
            <div key={item.label} className="space-y-0.5">
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>

              {/* Sub items if collapsed = false */}
              {!collapsed && visibleSubItems.length > 0 && (
                <div className="ml-3.5 pl-2.5 border-l border-border/40 space-y-0.5 my-1">
                  {visibleSubItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors',
                          isSubActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                        )}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
