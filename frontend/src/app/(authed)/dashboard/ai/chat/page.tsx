'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Bot, User, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

import { useAuth } from '@/components/providers/auth-provider';

export default function AIChatPage() {
  const { user } = useAuth();
  const userName = user?.firstName || 'User';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${userName}! I am your NEXHIRE AI Recruiting Assistant. I can help you search candidate databases, generate technical interview questions, or write job descriptions. What would you like to do today?`,
      timestamp: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      setThinking(false);
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Based on your request regarding "${userMsg.text}", I analyzed our candidate pool: Sarah Jenkins (98% match) and Michael Chen (95% match) are top recommendations for this requirement. Would you like me to schedule technical screens with them?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1200);
  };

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard/ai">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to AI Neural Suite</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Oracle 26ai Conversational Agent Active</span>
        </div>
      </div>

      {/* Chat Messages Window */}
      <Card className="glass border-white/10 flex-1 flex flex-col justify-between overflow-hidden">
        <CardContent className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-primary/20 border border-primary/30 text-foreground'
                    : 'bg-accent/40 border border-white/10 text-foreground'
                }`}
              >
                <p className="leading-relaxed text-sm">{m.text}</p>
                <span className="text-[10px] text-muted-foreground block text-right">{m.timestamp}</span>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3 text-xs">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-accent/40 border border-white/10 flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>NEXHIRE AI is analyzing candidate telemetry...</span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2 bg-black/40">
          <Input
            placeholder="Ask AI assistant (e.g. Find senior React engineers in SF with 5+ years experience)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-accent/30 border-white/10 focus:border-primary text-sm h-11"
          />
          <Button type="submit" className="primary-button h-11 px-5 gap-2" disabled={thinking}>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
