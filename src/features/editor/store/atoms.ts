import { atom } from 'jotai';
import type { ReactFlowInstance } from '@xyflow/react';
import type { NodeStatus } from '@/features/executions/lib/node-status';

// Store the React Flow instance to access it from other components (e.g., header save button)
export const editorInstanceAtom = atom<ReactFlowInstance | null>(null);

// Track if there are unsaved changes
export const hasUnsavedChangesAtom = atom(false);

// Track node execution statuses
export const nodeStatusesAtom = atom<Record<string, NodeStatus>>({});
