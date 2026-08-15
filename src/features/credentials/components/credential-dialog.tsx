'use client';

import { useState, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CredentialType } from '@/generated/prisma/enums';
import {
  CREDENTIAL_TYPE_LABELS,
  CREDENTIAL_TYPE_HINTS,
} from '../lib/credential-types';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

interface CredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Supply to rotate an existing credential's secret instead of creating one */
  editing?: { id: string; name: string; type: CredentialType } | null;
}

export function CredentialDialog({
  open,
  onOpenChange,
  editing = null,
}: CredentialDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [type, setType] = useState<CredentialType>(CredentialType.OPENAI);
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setType(editing?.type ?? CredentialType.OPENAI);
      setValue('');
      setErrors({});
    }
  }, [open, editing]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: trpc.credentials.getAll.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.credentials.getByType.queryKey() });
  };

  const createMutation = useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast.success('Credential saved');
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const updateMutation = useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: trpc.credentials.getOne.queryKey() });
        toast.success('Credential updated');
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Give this credential a name';
    // When editing, an empty value means "keep the existing secret"
    if (!editing && !value.trim()) newErrors.value = 'Paste the secret to store';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        name: name.trim(),
        ...(value.trim() ? { value: value.trim() } : {}),
      });
    } else {
      createMutation.mutate({ name: name.trim(), type, value: value.trim() });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Credential' : 'Add Credential'}
          </DialogTitle>
          <DialogDescription>
            Secrets are encrypted before they&apos;re stored and are never sent back to
            the browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cred-name">Name</Label>
            <Input
              id="cred-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My OpenAI key"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cred-type">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as CredentialType)}
              disabled={!!editing}
            >
              <SelectTrigger id="cred-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CredentialType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {CREDENTIAL_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {editing
                ? 'Type cannot be changed after creation.'
                : CREDENTIAL_TYPE_HINTS[type]}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cred-value">
              {editing ? 'New secret (optional)' : 'Secret'}
            </Label>
            <Input
              id="cred-value"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={editing ? 'Leave blank to keep the current secret' : 'Paste the value'}
              className="font-mono text-sm"
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
