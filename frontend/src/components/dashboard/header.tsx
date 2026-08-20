'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Settings, LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuth } from '@/components/providers/auth-provider';

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/candidates?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully.');
  };

  const displayName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Authenticated User');
  const displayEmail = user?.email || '';
  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || (user?.email?.[0] || 'U'))).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Mobile Drawer Trigger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search candidates, skills, or jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-accent/30 border-border/40 focus:border-primary text-xs h-8 rounded-lg"
          />
        </form>
      </div>

      {/* Theme Toggle & User Profile Dropdown */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-accent/40 animate-pulse border border-border/50" />
          ) : (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full p-0.5 border border-border/50 hover:border-primary transition-all"
              aria-label="User profile menu"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
              )}
            </button>
          )}

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-card p-1.5 shadow-xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-border/40">
                <p className="font-semibold text-xs text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile & Account</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </Link>
              </div>
              <div className="pt-1 border-t border-border/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/30 text-left transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
