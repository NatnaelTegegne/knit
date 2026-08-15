import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/config/constants';

export const credentialsSearchParams = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  search: parseAsString.withDefault(''),
};

export const credentialsSearchParamsCache =
  createSearchParamsCache(credentialsSearchParams);
