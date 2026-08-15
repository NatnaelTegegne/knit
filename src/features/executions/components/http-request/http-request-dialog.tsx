'use client';

import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { hasUnsavedChangesAtom } from '@/features/editor/store/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isValidVariableName, isUniqueVariableName } from '@/features/editor/lib/variables';
import { hasTemplateExpressions } from '@/features/executions/lib/templating';

interface HttpRequestData {
  variableName?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface HttpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function HttpRequestDialog({
  open,
  onOpenChange,
  nodeId,
}: HttpRequestDialogProps) {
  const { getNode, setNodes, getNodes } = useReactFlow();
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const node = getNode(nodeId);
  const data = (node?.data || {}) as HttpRequestData;

  const [variableName, setVariableName] = useState(data.variableName || '');
  const [method, setMethod] = useState(data.method || 'GET');
  const [url, setUrl] = useState(data.url || '');
  const [headersText, setHeadersText] = useState(
    data.headers ? JSON.stringify(data.headers, null, 2) : ''
  );
  const [body, setBody] = useState(data.body || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open && node) {
      const nodeData = node.data as HttpRequestData;
      setVariableName(nodeData.variableName || '');
      setMethod(nodeData.method || 'GET');
      setUrl(nodeData.url || '');
      setHeadersText(
        nodeData.headers ? JSON.stringify(nodeData.headers, null, 2) : ''
      );
      setBody(nodeData.body || '');
      setErrors({});
    }
  }, [open, node]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate variable name
    if (variableName && !isValidVariableName(variableName)) {
      newErrors.variableName =
        'Must start with a letter and contain only letters, numbers, and underscores';
    }

    if (variableName && !isUniqueVariableName(variableName, getNodes(), nodeId)) {
      newErrors.variableName = 'Variable name must be unique';
    }

    // Validate URL (skip strict validation if it contains template expressions)
    if (url && !hasTemplateExpressions(url)) {
      try {
        new URL(url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    // Validate headers JSON
    if (headersText) {
      try {
        JSON.parse(headersText);
      } catch {
        newErrors.headers = 'Invalid JSON format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    let parsedHeaders: Record<string, string> | undefined;
    if (headersText) {
      try {
        parsedHeaders = JSON.parse(headersText);
      } catch {
        // Already validated above
      }
    }

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              variableName: variableName || undefined,
              method,
              url: url || undefined,
              headers: parsedHeaders,
              body: body || undefined,
            },
          };
        }
        return n;
      })
    );

    setHasUnsavedChanges(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>HTTP Request Settings</DialogTitle>
          <DialogDescription>
            Configure the HTTP request. Use{' '}
            <code className="bg-muted px-1 rounded text-xs">
              {'{{'}variableName.field{'}}'}
            </code>{' '}
            to reference outputs from previous nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="httpResponse"
            />
            {errors.variableName && (
              <p className="text-sm text-destructive">{errors.variableName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used to reference this node&apos;s output in other nodes (e.g.,{' '}
              <code className="bg-muted px-1 rounded">
                {'{{'}variableName.data{'}}'}
              </code>
              )
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/users/{{trigger.userId}}"
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              className="font-mono text-sm"
              rows={3}
            />
            {errors.headers && (
              <p className="text-sm text-destructive">{errors.headers}</p>
            )}
          </div>

          {method !== 'GET' && (
            <div className="grid gap-2">
              <Label htmlFor="body">Request Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'{"userId": "{{trigger.data.userId}}"}'}
                className="font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use templates to include data from previous nodes
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
