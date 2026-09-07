import { useEffect, useState } from 'react';

type ReferenceDetails = Record<string, string>;

const requests = new Map<string, Promise<ReferenceDetails>>();

function loadReferenceDetails(url: string) {
    let request = requests.get(url);
    if (!request) {
        request = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`${response.status} fetching ${url}`);
                }
                return response.json();
            })
            .catch((error) => {
                // Drop the failure so the next expand retries rather than reusing a rejected promise.
                requests.delete(url);
                throw error;
            });
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
        loadReferenceDetails(url)
            .then((loaded) => {
                if (active) {
                    setDetails(loaded);
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('<api-documentation>: could not load type details.', error);
            });

        return () => {
            active = false;
        };
    }, [url, enabled, details]);

    return details;
}
