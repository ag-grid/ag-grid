import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

export function useSearchQuery() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const handleSearchQueryChange = useCallback((event: ChangeEvent<{ value: string }>) => {
        const value = event.target?.value;
        setSearchQuery(value);
    }, []);

    useEffect(() => {
        const searchParams = window.location.search;
        const urlSearchQuery = new URLSearchParams(searchParams).get('searchQuery');
        const value = searchParams && urlSearchQuery ? urlSearchQuery : '';
        setSearchQuery(value);
    }, []);

    return {
        searchQuery,
        handleSearchQueryChange,
    };
}
