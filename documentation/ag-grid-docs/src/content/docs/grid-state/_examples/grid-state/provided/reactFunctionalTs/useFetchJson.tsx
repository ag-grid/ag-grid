import { useEffect, useState } from 'react';

/**
 * Fetch example Json data
 * Not recommended for production use!
 */
export const useFetchJson = <T,>(url: string, limit?: number) => {
    const [data, setData] = useState<T[]>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // StrictMode runs this effect twice: drop the superseded run's response rather than applying both.
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);

            // Note error handling is omitted here for brevity
            const response = await fetch(url);
            const json = await response.json();
            const data = limit ? json.slice(0, limit) : json;
            if (cancelled) {
                return;
            }
            setData(data);
            setLoading(false);
        };
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [url, limit]);
    return { data, loading };
};
