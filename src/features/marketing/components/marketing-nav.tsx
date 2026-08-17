import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MarketingNavProps {
  isAuthenticated: boolean;
}

export function MarketingNav({ isAuthenticated }: MarketingNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* logo.svg is a wordmark, not a mark — it already reads "Knit", so no
            adjacent text, and its own 59.5:28.3 ratio to avoid squashing it. */}
        <Link href="/" aria-label="Knit home" className="flex items-center">
          <Image src="/logos/logo.svg" alt="Knit" width={59} height={28} priority />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#nodes" className="transition-colors hover:text-foreground">
            Nodes
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
        </div>

        {isAuthenticated ? (
          <Button asChild size="sm">
            <Link href="/workflows">Go to dashboard</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
