'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

export default function CreateJobAliasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  useEffect(() => {
    if (!loading) {
      if (user && isRecruiter) {
        router.replace('/dashboard/jobs/new');
      } else {
        toast.error('You do not have permission to perform this action.');
        router.replace('/dashboard');
      }
    }
  }, [user, loading, isRecruiter, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
