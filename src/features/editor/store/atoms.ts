import { atom } from 'jotai';
import type { ReactFlowInstance } from '@xyflow/react';

// Store the React Flow instance to access it from other components (e.g., header save button)
export const editorInstanceAtom = atom<ReactFlowInstance | null>(null);

// Track if there are unsaved changes
export const hasUnsavedChangesAtom = atom(false);
