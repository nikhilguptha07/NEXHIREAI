import { BrandMark } from '@/components/layout/brand-mark';
import { Twitter, Linkedin, Github } from 'lucide-react';
import Link from 'next/link';

export function PremiumFooter() {
  return (
    <footer className="relative bg-background border-t border-border/40 pt-20 pb-10 overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-aurora opacity-10 pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <BrandMark size={32} />
            <p className="mt-6 text-muted-foreground max-w-sm">
              The AI-native recruiting platform built for the future of work. Faster, smarter, and bias-free.
            </p>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-muted/60 transition-colors border border-border/40">
                <Twitter className="w-5 h-5 text-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-muted/60 transition-colors border border-border/40">
                <Linkedin className="w-5 h-5 text-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-muted/60 transition-colors border border-border/40">
                <Github className="w-5 h-5 text-foreground" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Resume AI</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Semantic Search</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Enterprise Security</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-6">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest AI hiring trends.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                suppressHydrationWarning
                className="bg-muted/40 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary flex-1 placeholder:text-muted-foreground"
              />
              <button suppressHydrationWarning className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NEXHIRE AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
