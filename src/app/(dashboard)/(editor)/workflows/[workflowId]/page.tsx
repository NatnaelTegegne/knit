import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchWorkflow } from '@/features/workflows/server/prefetch';
import { EditorHeader } from '@/features/editor/components/editor-header';

interface WorkflowEditorPageProps {
  params: Promise<{ workflowId: string }>;
}

export default async function WorkflowEditorPage({ params }: WorkflowEditorPageProps) {
  const { workflowId } = await params;
  const queryClient = await prefetchWorkflow(workflowId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen flex-col">
        <Suspense fallback={<EditorHeaderLoading />}>
          <EditorHeader workflowId={workflowId} />
        </Suspense>
        <main className="flex-1 bg-muted/30">
          {/* Editor canvas will be added in later chapters */}
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Workflow Editor Canvas
          </div>
        </main>
      </div>
    </HydrationBoundary>
  );
}

function EditorHeaderLoading() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </div>
    </header>
  );
}
