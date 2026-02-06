import { type WritableAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { logErrorMessage } from '../model/utils';

export const STORAGE_KEY_PREFIX = 'theme-builder.atom.';

const storageKey = (key: string) => STORAGE_KEY_PREFIX + key;

const IS_BROWSER = typeof localStorage === 'object';

class JSONStorage<T> {
    getItem(key: string, initialValue: T): T {
        if (!IS_BROWSER) {
            return initialValue;
        }
        const storedString = localStorage.getItem(storageKey(key));
        if (storedString == null) {
            return initialValue;
        }
        let storedValue: unknown;
        try {
            storedValue = JSON.parse(storedString);
        } catch {
            logErrorMessage(`Failed to parse stored JSON for ${key}: ${storedString}`);
            return initialValue;
        }
        return storedValue as T;
    }
    setItem(key: string, newValue: T): void {
        if (!IS_BROWSER) {
            return;
        }
        if (newValue === undefined) {
            return this.removeItem(key);
        }
        localStorage.setItem(storageKey(key), JSON.stringify(newValue));
    }
    removeItem(key: string): void {
        if (!IS_BROWSER) {
            return;
        }
        localStorage.removeItem(storageKey(key));
    }
}

export const atomWithJSONStorage = <T>(key: string, initialValue: T) => {
    const storage = new JSONStorage<T>();
    return atomWithStorage(key, storage.getItem(key, initialValue), storage);
};

export type PersistentAtom<T> = WritableAtom<T, [arg: T], void>;
