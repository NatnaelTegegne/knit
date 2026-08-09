'use client';

import { useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NodeType } from '@/generated/prisma/enums';
import { NODE_TYPE_LABELS, NODE_TYPE_DESCRIPTIONS, NODE_CATEGORIES } from '@/config/node-components';
import { PlayIcon, GlobeIcon, FileSpreadsheetIcon } from 'lucide-react';
import type { Node as ReactFlowNode } from '@xyflow/react';
import { createId } from '@paralleldrive/cuid2';
import { generateVariableName } from '../lib/variables';

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: ReactFlowNode) => void;
  existingNodes: ReactFlowNode[];
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  [NodeType.INITIAL]: <PlayIcon className="h-5 w-5" />,
  [NodeType.MANUAL_TRIGGER]: <PlayIcon className="h-5 w-5 text-primary" />,
  [NodeType.GOOGLE_FORM_TRIGGER]: <FileSpreadsheetIcon className="h-5 w-5 text-green-600" />,
  [NodeType.HTTP_REQUEST]: <GlobeIcon className="h-5 w-5" />,
};

export function NodeSelector({
  open,
  onOpenChange,
  onAddNode,
  existingNodes,
}: NodeSelectorProps) {
  // Check if triggers already exist (only one of each type allowed per workflow)
  const hasManualTrigger = existingNodes.some(
    (node) => node.type === NodeType.MANUAL_TRIGGER
  );
  const hasGoogleFormTrigger = existingNodes.some(
    (node) => node.type === NodeType.GOOGLE_FORM_TRIGGER
  );

  const handleAddNode = useCallback(
    (type: NodeType) => {
      // Calculate position based on existing nodes
      const lastNode = existingNodes[existingNodes.length - 1];
      const position = lastNode
        ? { x: lastNode.position.x + 300, y: lastNode.position.y }
        : { x: 100, y: 100 };

      // Generate a unique variable name for this node
      const variableName = generateVariableName(type, existingNodes);

      const newNode: ReactFlowNode = {
        id: createId(),
        type,
        position,
        data: { variableName },
      };

      onAddNode(newNode);
      onOpenChange(false);
    },
    [existingNodes, onAddNode, onOpenChange]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Add Node</SheetTitle>
          <SheetDescription>
            Select a node type to add to your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Triggers Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Triggers
            </h3>
            <div className="space-y-2">
              {NODE_CATEGORIES.triggers.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleAddNode(type)}
                  disabled={
                    (type === NodeType.MANUAL_TRIGGER && hasManualTrigger) ||
                    (type === NodeType.GOOGLE_FORM_TRIGGER && hasGoogleFormTrigger)
                  }
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    {NODE_ICONS[type]}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{NODE_TYPE_LABELS[type]}</div>
                    <div className="text-xs text-muted-foreground">
                      {(type === NodeType.MANUAL_TRIGGER && hasManualTrigger) ||
                      (type === NodeType.GOOGLE_FORM_TRIGGER && hasGoogleFormTrigger)
                        ? 'Already added (only one allowed)'
                        : NODE_TYPE_DESCRIPTIONS[type]}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Actions
            </h3>
            <div className="space-y-2">
              {NODE_CATEGORIES.actions.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleAddNode(type)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                    {NODE_ICONS[type]}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{NODE_TYPE_LABELS[type]}</div>
                    <div className="text-xs text-muted-foreground">
                      {NODE_TYPE_DESCRIPTIONS[type]}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
