import { useStore } from '@nanostores/react';
import type { Atom } from 'nanostores';

import { useIsSsr } from './useIsSsr';

export const useStoreSsr = <T>(store: Atom<T>, ssrValue: T) => {
    const isSsr = useIsSsr();
    const storeValue = useStore(store);
    return isSsr ? ssrValue : storeValue;
};
