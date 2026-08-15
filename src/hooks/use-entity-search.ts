'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryStates } from 'nuqs';
import { SEARCH_DEBOUNCE_MS, DEFAULT_PAGE } from '@/config/constants';

type SearchParamsShape = Parameters<typeof useQueryStates>[0];

/**
 * Debounced search + pagination bound to URL state.
 * Generic over a nuqs param definition so each entity slice can pass its own.
 */
export function useEntitySearch(searchParams: SearchParamsShape) {
  const [params, setParams] = useQueryStates(searchParams);
  const currentSearch = params.search as string;
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        // Reset to the first page whenever the query changes
        setParams({ search: searchInput, page: DEFAULT_PAGE });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, setParams]);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const setPage = useCallback(
    (page: number) => {
      setParams({ page });
    },
    [setParams]
  );

  return {
    search: searchInput,
    page: params.page as number,
    pageSize: params.pageSize as number,
    onSearchChange,
    setPage,
  };
}
