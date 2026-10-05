import { createStore } from 'jotai';

import { STORAGE_KEY_PREFIX, atomWithJSONStorage } from './JSONStorage';

export type Store = ReturnType<typeof createStore>;

const versionAtom = atomWithJSONStorage<string | null>('model-version', null);

// an additional string added to the version string used to bust the saved data
// cache when the internal format changes during development of a release
const FORMAT_CHANGE_KEY = '20240704';

let productVersion = 'unversioned';

/** The host product's version, so each release clears models saved against the params it shipped before. */
export const setProductVersion = (version: string) => {
    productVersion = version;
};

export const initialiseStore = (): Store => {
    const store = createStore();
    const expectedVersion = `${productVersion}.${FORMAT_CHANGE_KEY}`;
    const version = store.get(versionAtom);
    if (version !== expectedVersion) {
        for (const key of Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY_PREFIX))) {
            localStorage.removeItem(key);
        }
        store.set(versionAtom, expectedVersion);
    }
    return store;
};
