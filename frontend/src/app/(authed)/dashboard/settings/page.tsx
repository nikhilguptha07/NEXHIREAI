'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Sliders, Bell, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('nex_live_9f8371894a7e912c94a');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoMatch, setAutoMatch] = useState(true);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('nexhire_apiKey');
      const savedAuto = localStorage.getItem('nexhire_autoMatch');
      if (savedKey) setApiKey(savedKey);
      if (savedAuto !== null) setAutoMatch(savedAuto === 'true');
    } catch (_err) {
      // Ignore
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('nexhire_apiKey', apiKey);
      localStorage.setItem('nexhire_autoMatch', String(autoMatch));
    } catch (_err) {
      // Ignore
    }
    toast.success('Workspace preferences saved successfully!');
  };

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure AI match thresholds, notifications, and API integrations.
        </p>
      </div>

      <Card className="glass border-white/10 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              API Key & Webhooks
            </h3>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Production API Key</Label>
              <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="bg-black/40 border-white/10 font-mono text-xs" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-400" />
              AI Vector Match Thresholds
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-white/5">
              <div>
                <p className="font-bold text-xs">Autonomous Shortlisting</p>
                <p className="text-xs text-muted-foreground">Automatically shortlist candidates scoring above 90% match.</p>
              </div>
              <input
                type="checkbox"
                checked={autoMatch}
                onChange={(e) => setAutoMatch(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" className="primary-button text-xs gap-2">
              <Check className="h-4 w-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
