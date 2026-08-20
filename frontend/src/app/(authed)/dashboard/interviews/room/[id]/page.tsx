'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { VideoRoom } from '@/components/interviews/video-room';
import { DashboardService } from '@/services/dashboard.service';
import { type InterviewSession } from '@/lib/mock-data';
import { useAuth } from '@/components/providers/auth-provider';

export default function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [resolvedParams.id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const interviews = await DashboardService.getInterviews();
      const found = interviews.find((i) => i.id === resolvedParams.id) || interviews[0];
      if (found) {
        setSession(found);
      }
    } catch (_err) {
      toast.error('Failed to load interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    toast.info('Left technical interview room.');
    router.push('/dashboard/interviews');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/interviews">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Meeting Room</span>
        </Link>
      </Button>

      <VideoRoom
        roomId={resolvedParams.id}
        userName={user ? `${user.firstName} ${user.lastName}` : 'NEXHIRE User'}
        userRole={isRecruiter ? 'RECRUITER' : 'CANDIDATE'}
        jobTitle={session?.jobTitle}
        onLeave={handleLeave}
      />
    </div>
  );
}
