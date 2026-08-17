const STEPS = [
  {
    title: 'Pick what starts it',
    body: 'A form submission, a Stripe event, or a manual click. Triggers only have an output, so a workflow always has one clear beginning.',
  },
  {
    title: 'Wire up the middle',
    body: 'Call an API, send a prompt to a model, reshape the result. Each node can reference the output of any node before it.',
  },
  {
    title: 'Hit execute',
    body: 'The run is queued and executed step by step, retrying what fails. Watch the nodes light up, then read the full output afterwards.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Three steps, then it runs on its own
          </h2>
        </div>

        {/* Numbered because these genuinely happen in order */}
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-mono text-sm text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-pretty text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
