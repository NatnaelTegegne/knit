import { ArrowRightIcon } from 'lucide-react';
import { PREVIEW_NODES } from '../lib/content';
import { cn } from '@/lib/utils';

/**
 * A static mock of the editor canvas, built from the same visual parts as the
 * real nodes (rounded card, tinted icon tile, label + caption) so the page
 * shows the actual product rather than an abstract illustration.
 */
export function WorkflowPreview() {
  return (
    <div
      aria-label="Example workflow: a Google Form submission fetches customer data, summarises it with Gemini, and posts the result to Slack"
      className="relative rounded-xl border bg-card p-5 shadow-lg sm:p-7"
    >
      {/* Canvas dot grid, matching the editor background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.35] [background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]"
      />

      <div className="relative flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {PREVIEW_NODES.map((node, index) => (
          <div key={node.label} className="flex items-center gap-3 lg:flex-1">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border bg-background p-3 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <node.icon className={cn('h-4.5 w-4.5', node.className)} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{node.label}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {node.caption}
                </div>
              </div>
            </div>

            {index < PREVIEW_NODES.length - 1 && (
              <ArrowRightIcon
                aria-hidden
                className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground/60 lg:rotate-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
