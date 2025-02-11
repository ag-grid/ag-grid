import { useStore } from '@nanostores/react';
import type { Atom } from 'nanostores';
import { useEffect, useState } from 'react';

import { useIsSsr } from './useIsSsr';

export const useStoreSsr = <T>(store: Atom<T>, ssrValue: T) => {
    const [value, setValue] = useState(ssrValue);

    useEffect(() => {
        setValue(store.get());

        store.listen(() => {
            setValue(store.get());
        });
    }, []);

    return value;
};
