'use client';

import Link from 'next/link';
import { Sparkles, FileSearch, Sliders, MessageSquare, ArrowRight, Bot, Cpu, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AISuiteHubPage() {
  const AI_TOOLS = [
    {
      title: 'AI Resume Scanner',
      desc: 'Drag and drop PDF/DOCX resumes to extract canonical skills, experience timelines, and structured JSON entities.',
      href: '/dashboard/ai/resume-scanner',
      icon: FileSearch,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400',
    },
    {
      title: 'Vector Candidate Ranking',
      desc: 'Rank candidate pools using Oracle 26ai vector similarity search against active job requisitions.',
      href: '/dashboard/ai/resume-ranking',
      icon: Sliders,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    },
    {
      title: 'AI Recruiting Assistant',
      desc: 'Chat with NEXHIRE AI to query candidate databases, generate interview questions, and write job descriptions.',
      href: '/dashboard/ai/chat',
      icon: MessageSquare,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400',
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Neural Suite</h1>
        <p className="text-sm text-muted-foreground">
          Autonomous recruitment intelligence tools powered by Oracle 26ai AI Vector Search & LLMs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="glass border-white/10 p-6 flex flex-col justify-between hover:border-primary/40 transition-all">
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl w-fit bg-gradient-to-br ${tool.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              </div>

              <Button size="sm" className="primary-button text-xs gap-2 mt-6 w-full" asChild>
                <Link href={tool.href}>
                  Launch Tool <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
