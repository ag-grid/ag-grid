import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

export function useSearchQuery() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const hasInitialisedUrl = useRef(false);

    const handleSearchQueryChange = useCallback((event: ChangeEvent<{ value: string }>) => {
        const value = event.target?.value;
        setSearchQuery(value);
    }, []);

    useEffect(() => {
        const searchParams = window.location.search;
        const urlSearchQuery = new URLSearchParams(searchParams).get('searchQuery');
        const value = searchParams && urlSearchQuery ? urlSearchQuery : '';
        setSearchQuery(value);
        hasInitialisedUrl.current = true;
    }, []);

    // Sync to URL with debounce
    useEffect(() => {
        if (!hasInitialisedUrl.current) {
            return;
        }
        const timeoutId = setTimeout(() => {
            const url = new URL(window.location.href);
            if (searchQuery) {
                url.searchParams.set('searchQuery', searchQuery);
            } else {
                url.searchParams.delete('searchQuery');
            }
            window.history.replaceState(null, '', url.toString());
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return {
        searchQuery,
        handleSearchQueryChange,
    };
}
