'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node as ReactFlowNode,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { nodeTypes } from '@/config/node-components';
import { NodeSelector } from './node-selector';
import { AddNodeButton } from './add-node-button';
import { editorInstanceAtom, hasUnsavedChangesAtom, nodeStatusesAtom } from '../store/atoms';
import { useNodeStatus } from '@/features/executions/hooks/use-node-status';

interface EditorProps {
  workflowId: string;
}

export function Editor({ workflowId }: EditorProps) {
  const trpc = useTRPC();
  const setEditorInstance = useSetAtom(editorInstanceAtom);
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const setNodeStatuses = useSetAtom(nodeStatusesAtom);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const { data: workflow } = useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({ id: workflowId })
  );

  // Subscribe to real-time node status updates
  const { statuses } = useNodeStatus({ workflowId });

  // Sync statuses to atom for node components to consume
  useEffect(() => {
    setNodeStatuses(statuses);
  }, [statuses, setNodeStatuses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges, setHasUnsavedChanges]
  );

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Mark as unsaved if nodes are moved, added, or removed
      const hasRelevantChange = changes.some(
        (change) => change.type === 'position' || change.type === 'remove'
      );
      if (hasRelevantChange) {
        setHasUnsavedChanges(true);
      }
    },
    [onNodesChange, setHasUnsavedChanges]
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (changes.some((change) => change.type === 'remove')) {
        setHasUnsavedChanges(true);
      }
    },
    [onEdgesChange, setHasUnsavedChanges]
  );

  const handleAddNode = useCallback(
    (node: ReactFlowNode) => {
      setNodes((nds) => [...nds, node]);
      setHasUnsavedChanges(true);
    },
    [setNodes, setHasUnsavedChanges]
  );

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setEditorInstance(instance);
    },
    [setEditorInstance]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      <AddNodeButton onClick={() => setSelectorOpen(true)} />

      <NodeSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onAddNode={handleAddNode}
        existingNodes={nodes}
      />
    </div>
  );
}
