import { atomWithStorage } from 'jotai/utils';
import { logErrorMessage } from 'model/utils';

interface SyncStorage<Value> {
  getItem: (key: string, initialValue: Value) => Value;
  setItem: (key: string, newValue: Value) => void;
  removeItem: (key: string) => void;
}

const storageKey = (key: string) => `theme-builder.theme-state.${key}`;

class JSONStorage<T> implements SyncStorage<T> {
  getItem(key: string, initialValue: T): T {
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
    // TODO validation / deserialization
    return storedValue as T;
  }
  setItem(key: string, newValue: T): void {
    if (newValue === undefined) {
      return this.removeItem(key);
    }
    // TODO serialisation
    localStorage.setItem(storageKey(key), JSON.stringify(newValue));
  }
  removeItem(key: string): void {
    localStorage.removeItem(storageKey(key));
  }
}

export const atomWithJSONStorage = <T>(key: string, initialValue: T) =>
  atomWithStorage(
    key,
    initialValue,
    // need to cast JSONStorage to undefined because a bug in jotai's typings
    // doesn't recognise SyncStorage and thinks it's an AsyncStorage
    new JSONStorage() as unknown as undefined,
  );
