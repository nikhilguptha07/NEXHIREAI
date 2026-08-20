'use client';

import { FileText, Download, Calendar, Filter, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const REPORTS = [
    { title: 'Monthly Hiring Velocity & Funnel Report', date: 'July 2026', format: 'PDF / CSV' },
    { title: 'AI Match Score Accuracy & Audit Telemetry', date: 'Q2 2026', format: 'JSON / CSV' },
    { title: 'Time-to-Hire & Department Bottleneck Analysis', date: 'YTD 2026', format: 'PDF' },
  ];

  const handleDownload = (title: string, format: string) => {
    toast.success(`Exporting "${title}" (${format})...`);
    
    try {
      const dataStr = `Report: ${title}\nGenerated Date: ${new Date().toISOString()}\nPlatform: NEXHIRE AI\nStatus: Verified\nSummary: Enterprise Recruiting Telemetry Export\n`;
      const blob = new Blob([dataStr], { type: format.includes('CSV') ? 'text/csv;charset=utf-8;' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.${format.includes('CSV') ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_err) {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Reports</h1>
          <p className="text-sm text-muted-foreground">
            Export executive summaries, audit logs, and candidate pipeline reports.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {REPORTS.map((r) => (
          <Card key={r.title} className="glass border-white/10 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.date} • Format: {r.format}</p>
              </div>
            </div>

            <Button onClick={() => handleDownload(r.title, r.format)} size="sm" variant="outline" className="glass text-xs gap-2">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
