import { useEffect, useState } from 'react';

/**
 * Fetch example Json data
 * Not recommended for production use!
 */
export const useFetchJson = <T,>(url: string, limit?: number) => {
    const [data, setData] = useState<T[]>();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Note error handling is omitted here for brevity
            const response = await fetch(url);
            const json = await response.json();
            const data = limit ? json.slice(0, limit) : json;
            setData(data);
            setLoading(false);
        };
        fetchData();
    }, [url, limit]);
    return { data, loading };
};
