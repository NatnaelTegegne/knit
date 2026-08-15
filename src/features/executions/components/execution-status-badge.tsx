import { Badge } from '@/components/ui/badge';
import { CheckCircle2Icon, XCircleIcon, Loader2Icon } from 'lucide-react';
import { ExecutionStatus } from '@/generated/prisma/enums';
import { cn } from '@/lib/utils';

const CONFIG = {
  [ExecutionStatus.RUNNING]: {
    label: 'Running',
    icon: Loader2Icon,
    className: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    spin: true,
  },
  [ExecutionStatus.SUCCESS]: {
    label: 'Success',
    icon: CheckCircle2Icon,
    className: 'border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400',
    spin: false,
  },
  [ExecutionStatus.FAILED]: {
    label: 'Failed',
    icon: XCircleIcon,
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
    spin: false,
  },
} as const;

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-normal', config.className)}>
      <Icon className={cn('h-3 w-3', config.spin && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}
