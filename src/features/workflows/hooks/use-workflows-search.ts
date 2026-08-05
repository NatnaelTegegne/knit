'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryStates } from 'nuqs';
import { workflowsSearchParams } from '../params';
import { SEARCH_DEBOUNCE_MS, DEFAULT_PAGE } from '@/config/constants';

export function useWorkflowsSearch() {
  const [params, setParams] = useQueryStates(workflowsSearchParams);
  const [searchInput, setSearchInput] = useState(params.search);

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== params.search) {
        setParams({
          search: searchInput,
          page: DEFAULT_PAGE, // Reset to first page on search
        });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, params.search, setParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const setPage = useCallback((page: number) => {
    setParams({ page });
  }, [setParams]);

  return {
    search: searchInput,
    page: params.page,
    pageSize: params.pageSize,
    onSearchChange: handleSearchChange,
    setPage,
  };
}
