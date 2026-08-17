import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowPreview } from './workflow-preview';

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-5 font-mono text-xs tracking-[0.16em] text-primary uppercase">
          Visual workflow automation
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Connect your tools without writing the glue code
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          Drag nodes onto a canvas, wire them together, and let them run in the
          background — started by a form response, a payment, or a click.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/workflows">
                Go to your workflows
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signup">
                  Start building free
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          No credit card. Bring your own API keys.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <WorkflowPreview />
      </div>
    </section>
  );
}
