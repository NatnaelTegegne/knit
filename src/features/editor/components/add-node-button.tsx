'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface AddNodeButtonProps {
  onClick: () => void;
}

export function AddNodeButton({ onClick }: AddNodeButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="absolute bottom-4 right-4 z-10 shadow-lg"
    >
      <PlusIcon className="mr-2 h-4 w-4" />
      Add Node
    </Button>
  );
}
