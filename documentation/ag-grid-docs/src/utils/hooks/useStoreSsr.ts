import { useStore } from '@nanostores/react';
import type { Atom } from 'nanostores';
import { useEffect, useState } from 'react';

export const useStoreSsr = <T>(store: Atom<T>, ssrValue: T) => {
    const [value, setValue] = useState<T>(ssrValue);
    const storeValue = useStore(store);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration pattern
        setValue(storeValue);
    }, [storeValue]);

    return value;
};
