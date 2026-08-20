import { SiteHeader } from '@/components/layout/site-header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ResumeScannerSection } from '@/components/landing/ResumeScannerSection';
import { AIFeaturesSection } from '@/components/landing/AIFeaturesSection';
import { DashboardPreviewSection } from '@/components/landing/DashboardPreviewSection';
import { HiringProcessSection } from '@/components/landing/HiringProcessSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PremiumFooter } from '@/components/landing/PremiumFooter';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30 transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <ResumeScannerSection />
        <AIFeaturesSection />
        <DashboardPreviewSection />
        <HiringProcessSection />
        <TestimonialsSection />
      </main>

      <PremiumFooter />
    </div>
  );
}