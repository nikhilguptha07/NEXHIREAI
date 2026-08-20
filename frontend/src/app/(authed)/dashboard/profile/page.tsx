'use client';

import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Shield, Building, Key, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { authService } from '@/services/auth.service';

export default function UserProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required.');
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await refreshUser();
      queryClient.invalidateQueries();
      toast.success('Profile details saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-2 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-accent/40 rounded-lg animate-pulse" />
        <div className="h-64 bg-accent/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const displayName = user?.fullName || (firstName ? `${firstName} ${lastName}`.trim() : email || 'User');
  const initials = ((firstName?.[0] || '') + (lastName?.[0] || (email?.[0] || 'U'))).toUpperCase();
  const primaryRole = user?.roles?.[0] || 'RECRUITER';

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your authenticated identity, security credentials, and system roles.
        </p>
      </div>

      <Card className="glass border-white/10 p-6">
        <CardHeader className="p-0 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="h-16 w-16 rounded-2xl object-cover border-2 border-primary/40 shadow-xl" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-xl">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-bold">{displayName}</CardTitle>
                <Badge variant="outline" className="text-xs uppercase font-bold text-primary border-primary/40 bg-primary/10">
                  {primaryRole}
                </Badge>
              </div>
              <CardDescription className="text-xs pt-1">{email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-black/40 border-white/10" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-black/40 border-white/10" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input value={email} disabled className="bg-accent/40 border-white/10 opacity-80 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User ID</Label>
                <Input value={user?.id || 'AUTH_SESSION_ACTIVE'} disabled className="bg-accent/40 border-white/10 font-mono text-xs opacity-80" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="primary-button text-xs gap-2">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
