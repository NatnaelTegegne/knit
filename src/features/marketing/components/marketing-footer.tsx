import Image from 'next/image';
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" aria-label="Knit home" className="flex items-center">
          <Image src="/logos/logo.svg" alt="Knit" width={50} height={24} />
        </Link>

        <p className="text-sm text-muted-foreground">
          Workflow automation you can watch run.
        </p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
