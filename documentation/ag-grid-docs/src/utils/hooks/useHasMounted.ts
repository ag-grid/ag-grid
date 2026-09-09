import { useEffect, useState } from 'react';

/**
 * `false` on the server and for the first client render, `true` once the component has mounted.
 *
 * For islands whose UI depends on browser-only state (localStorage stores, client queries): the
 * server render and the hydrating render agree on an empty tree, and the real UI follows at once.
 */
export const useHasMounted = () => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration pattern
        setHasMounted(true);
    }, []);

    return hasMounted;
};
