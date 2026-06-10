import { QueryClient } from '@tanstack/react-query';
import { atom } from 'nanostores';

export const $queryClient = atom(new QueryClient());

export const defaultQueryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};
