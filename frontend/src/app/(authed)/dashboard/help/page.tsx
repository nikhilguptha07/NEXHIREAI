'use client';

import { HelpCircle, BookOpen, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HelpDocsPage() {
  const ARTICLES = [
    { title: 'Getting Started with Oracle 26ai Resume Parsing', category: 'AI Tools' },
    { title: 'Configuring Enterprise JWT & OAuth2 SSO', category: 'Security' },
    { title: 'Setting Up Custom Pipeline Hiring Stages', category: 'ATS Workflow' },
    { title: 'Exporting EEO & Diversity Compliance Reports', category: 'Analytics' },
  ];

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-sm text-muted-foreground">
          Learn how to maximize your hiring velocity with NEXHIRE AI platform tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARTICLES.map((art) => (
          <Card key={art.title} className="glass border-white/10 p-5 hover:border-primary/40 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {art.category}
            </span>
            <h3 className="font-bold text-sm text-foreground mt-2 mb-4">{art.title}</h3>
            <Button size="sm" variant="ghost" className="text-xs text-primary gap-1 p-0">
              Read Guide <ExternalLink className="h-3 w-3" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
