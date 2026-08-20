'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-background shadow-2xl z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 z-50 p-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 md:px-8 pb-12 max-w-7xl w-full mx-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
