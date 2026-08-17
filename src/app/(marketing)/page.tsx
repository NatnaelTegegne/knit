import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { MarketingNav } from '@/features/marketing/components/marketing-nav';
import { MarketingFooter } from '@/features/marketing/components/marketing-footer';
import { Hero } from '@/features/marketing/components/hero';
import { HowItWorks } from '@/features/marketing/components/how-it-works';
import { NodeCatalogue } from '@/features/marketing/components/node-catalogue';
import { FeatureGrid } from '@/features/marketing/components/feature-grid';
import { CtaSection } from '@/features/marketing/components/cta-section';

export default async function LandingPage() {
  // Signed-in visitors get "go to dashboard" instead of "sign up" rather than
  // being redirected away — the page is still worth reading when logged in.
  const session = await auth.api.getSession({ headers: await headers() });
  const isAuthenticated = Boolean(session);

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingNav isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <HowItWorks />
        <NodeCatalogue />
        <FeatureGrid />
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>
      <MarketingFooter />
    </div>
  );
}
