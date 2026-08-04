import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-muted-foreground">
            Create and manage your automation workflows
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No workflows yet. Create your first workflow to get started.
        </p>
      </div>
    </div>
  );
}