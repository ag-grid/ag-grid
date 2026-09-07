import { useEffect, useState } from 'react';

type ReferenceDetails = Record<string, string>;

const requests = new Map<string, Promise<ReferenceDetails>>();

function loadReferenceDetails(url: string) {
    let request = requests.get(url);
    if (!request) {
        request = fetch(url).then((response) => response.json());
        requests.set(url, request);
    }

    return request;
}

/** Shared across every row on the page, so expanding a second row costs no further request. */
export function useReferenceDetails({ url, enabled }: { url?: string; enabled: boolean }) {
    const [details, setDetails] = useState<ReferenceDetails>();

    useEffect(() => {
        if (!enabled || !url || details) {
            return;
        }

        let active = true;
        loadReferenceDetails(url).then((loaded) => {
            if (active) {
                setDetails(loaded);
            }
        });

        return () => {
            active = false;
        };
    }, [url, enabled, details]);

    return details;
}
