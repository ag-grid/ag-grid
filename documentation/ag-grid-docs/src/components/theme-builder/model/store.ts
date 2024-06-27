import { VERSION } from '@ag-grid-community/theming';
import { createStore } from 'jotai';

import { STORAGE_KEY_PREFIX, atomWithJSONStorage } from './JSONStorage';

export type Store = ReturnType<typeof createStore>;

const versionAtom = atomWithJSONStorage<string | null>('model-version', null);

export const initialiseStore = (): Store => {
    const store = createStore();
    const version = store.get(versionAtom);
    if (version !== VERSION) {
        for (const key of Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY_PREFIX))) {
            localStorage.removeItem(key);
        }
        store.set(versionAtom, VERSION);
    }
    return store;
};
