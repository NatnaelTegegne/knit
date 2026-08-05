'use client';

import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Entity Container
interface EntityContainerProps {
  children: ReactNode;
  className?: string;
}

export function EntityContainer({ children, className }: EntityContainerProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

// Entity Header
interface EntityHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EntityHeader({ title, description, action }: EntityHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// Entity Search
interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EntitySearch({ value, onChange, placeholder = 'Search...' }: EntitySearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

// Entity List
interface EntityListProps {
  children: ReactNode;
  className?: string;
}

export function EntityList({ children, className }: EntityListProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}

// Entity Pagination
interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EntityPagination({ page, totalPages, onPageChange }: EntityPaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
      >
        Next
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Empty State
interface EntityEmptyProps {
  message: string;
}

export function EntityEmpty({ message }: EntityEmptyProps) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading State
interface EntityLoadingProps {
  count?: number;
}

export function EntityLoading({ count = 3 }: EntityLoadingProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted" />
      ))}
    </div>
  );
}

// Error State
interface EntityErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function EntityError({ message = 'Something went wrong', onRetry }: EntityErrorProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
      <AlertCircleIcon className="mx-auto h-8 w-8 text-destructive" />
      <p className="mt-2 text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
