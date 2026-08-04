export default function ExecutionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Executions</h1>
        <p className="text-muted-foreground">
          View the history of your workflow executions
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No executions yet. Run a workflow to see execution history.
        </p>
      </div>
    </div>
  );
}
