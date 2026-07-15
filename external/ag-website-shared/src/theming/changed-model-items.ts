import { atomWithJSONStorage } from './JSONStorage';
import type { Store } from './store';

const changedParamsAtom = atomWithJSONStorage<string[] | null>('changedParams', null);

export const addChangedModelItem = (store: Store, name: string) => {
    let existing = store.get(changedParamsAtom);
    if (!Array.isArray(existing)) {
        existing = [];
    }
    if (!existing.includes(name)) {
        store.set(changedParamsAtom, [...existing, name]);
    }
};

export const resetChangedModelItems = (store: Store) => {
    store.set(changedParamsAtom, null);
};

export const getChangedModelItemCount = (store: Store) => {
    const changes = store.get(changedParamsAtom);
    return Array.isArray(changes) ? changes.length : 0;
};
