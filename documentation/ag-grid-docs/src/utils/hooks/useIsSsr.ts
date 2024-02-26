import { useEffect, useState } from 'react';

// After the first round of useEffects has fired, the page has been hydrated, so we no longer need to consider what the SSR produced
let didHydrate = false;

// Manages SSRs and the hydration of a page
export const useIsSsr = () => {
    const [isSsr, setIsSsr] = useState(!didHydrate);

    useEffect(() => {
        didHydrate = true;
        setIsSsr(false);
    }, []);

    return isSsr;
};
