import { FEATURES } from '../lib/content';

export function FeatureGrid() {
  return (
    <section id="features" className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Features
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Built for workflows you have to trust
          </h2>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2">
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-pretty text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
