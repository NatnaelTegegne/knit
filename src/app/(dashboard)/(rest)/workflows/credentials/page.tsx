import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function CredentialsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Credentials</h1>
          <p className="text-muted-foreground">
            Store API keys and secrets for your workflow integrations
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No credentials stored. Add credentials to use in your workflows.
        </p>
      </div>
    </div>
  );
}