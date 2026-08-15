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
import {
  PlayIcon,
  GlobeIcon,
  FileSpreadsheetIcon,
  CreditCardIcon,
  SparklesIcon,
  BotIcon,
  BrainIcon,
  MessageSquareIcon,
  HashIcon,
} from 'lucide-react';
import type { Node as ReactFlowNode } from '@xyflow/react';
import { createId } from '@paralleldrive/cuid2';
import { generateVariableName } from '../lib/variables';

const SECTIONS = [
  { key: 'triggers', title: 'Triggers' },
  { key: 'actions', title: 'Actions' },
  { key: 'ai', title: 'AI' },
  { key: 'messaging', title: 'Messaging' },
] as const;

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: ReactFlowNode) => void;
  existingNodes: ReactFlowNode[];
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  [NodeType.INITIAL]: <PlayIcon className="h-5 w-5" />,
  [NodeType.MANUAL_TRIGGER]: <PlayIcon className="h-5 w-5 text-primary" />,
  [NodeType.GOOGLE_FORM_TRIGGER]: <FileSpreadsheetIcon className="h-5 w-5 text-purple-600" />,
  [NodeType.STRIPE_TRIGGER]: <CreditCardIcon className="h-5 w-5 text-indigo-600" />,
  [NodeType.HTTP_REQUEST]: <GlobeIcon className="h-5 w-5" />,
  [NodeType.OPENAI]: <SparklesIcon className="h-5 w-5 text-emerald-600" />,
  [NodeType.ANTHROPIC]: <BotIcon className="h-5 w-5 text-orange-600" />,
  [NodeType.GOOGLE_GEMINI]: <BrainIcon className="h-5 w-5 text-blue-600" />,
  [NodeType.DISCORD]: <MessageSquareIcon className="h-5 w-5 text-indigo-500" />,
  [NodeType.SLACK]: <HashIcon className="h-5 w-5 text-rose-500" />,
};

export function NodeSelector({
  open,
  onOpenChange,
  onAddNode,
  existingNodes,
}: NodeSelectorProps) {
  // Only one trigger of each type is allowed per workflow
  const hasTrigger = (type: NodeType) =>
    existingNodes.some((node) => node.type === type);

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

        {/* Sections render from NODE_CATEGORIES, so a new node type only needs
            adding there rather than another block here. */}
        <div className="mt-4 space-y-6 overflow-y-auto pb-4">
          {SECTIONS.map(({ key, title }) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {title}
              </h3>
              <div className="space-y-2">
                {NODE_CATEGORIES[key].map((type) => {
                  // Only triggers are limited to one per workflow
                  const isTakenTrigger = key === 'triggers' && hasTrigger(type);

                  return (
                    <Button
                      key={type}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3"
                      onClick={() => handleAddNode(type)}
                      disabled={isTakenTrigger}
                    >
                      <div
                        className={
                          key === 'triggers'
                            ? 'flex h-8 w-8 items-center justify-center rounded-md bg-primary/10'
                            : 'flex h-8 w-8 items-center justify-center rounded-md bg-secondary'
                        }
                      >
                        {NODE_ICONS[type]}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{NODE_TYPE_LABELS[type]}</div>
                        <div className="text-xs text-muted-foreground">
                          {isTakenTrigger
                            ? 'Already added (only one allowed)'
                            : NODE_TYPE_DESCRIPTIONS[type]}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
