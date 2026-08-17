import { NODE_GROUPS } from '../lib/content';
import { cn } from '@/lib/utils';

export function NodeCatalogue() {
  return (
    <section id="nodes" className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Nodes
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            The blocks you build with
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Every node here works today. AI and messaging nodes authenticate with
            credentials you add yourself, so your keys stay yours.
          </p>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {NODE_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <div>
                <h3 className="font-medium">{group.title}</h3>
                <p className="text-sm text-muted-foreground">{group.blurb}</p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {group.nodes.map((node) => (
                  <li
                    key={node.label}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <node.icon className={cn('h-4.5 w-4.5', node.className)} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{node.label}</div>
                      {/* wraps rather than truncates — the cards are narrow at
                          four columns and these descriptions are the point */}
                      <div className="text-xs text-pretty text-muted-foreground">
                        {node.description}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
