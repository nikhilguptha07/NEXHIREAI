'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle, Sparkles, Calendar, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardService } from '@/services/dashboard.service';
import { type NotificationItem } from '@/lib/mock-data';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    DashboardService.getNotifications().then(setNotifications);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground">
            Real-time candidate matches, interview reminders, and system events.
          </p>
        </div>

        <Button onClick={handleMarkAllRead} variant="outline" size="sm" className="glass text-xs gap-1">
          <Check className="h-3.5 w-3.5 text-green-400" />
          <span>Mark All as Read</span>
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`glass border-white/10 p-4 transition-all ${
              !n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5">
                  {n.type === 'AI_RANKING' ? (
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  ) : n.type === 'INTERVIEW' ? (
                    <Calendar className="h-4 w-4 text-blue-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{n.title}</h3>
                  <p className="text-xs text-muted-foreground pt-0.5">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground block pt-2">{n.timestamp}</span>
                </div>
              </div>

              {n.link && (
                <Button size="sm" variant="ghost" className="text-xs text-primary shrink-0" asChild>
                  <Link href={n.link}>View →</Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
