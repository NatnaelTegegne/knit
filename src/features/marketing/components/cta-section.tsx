import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CtaSectionProps {
  isAuthenticated: boolean;
}

export function CtaSection({ isAuthenticated }: CtaSectionProps) {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {isAuthenticated
            ? 'Pick up where you left off'
            : 'Build your first workflow in a few minutes'}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          {isAuthenticated
            ? 'Your canvas is waiting.'
            : 'Start with a manual trigger and an HTTP request. Add a model, send the result to Slack, and let it run itself from there.'}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={isAuthenticated ? '/workflows' : '/signup'}>
              {isAuthenticated ? 'Open dashboard' : 'Create your account'}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="outline">
              <Link href="/login">I already have an account</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
