// Allocated on first cache write; most test runs never populate it, so keep it null until needed.
let cachedJSONObjectsMap: Map<string, any> | null = null;

export const cachedJSONObjects = {
    /** Clears the cache of JSON objects. */
    clear() {
        cachedJSONObjectsMap = null;
    },

    /**
     * This is useful for writing test code without having to store in variables the objects that are created.
     * This JSON stringify the object to use as a key in a global map, and if the object is already in the map, it returns the cached object.
     * You can call cachedJSONObjects.clear() to clear the cache on beforeEach() call.
     */
    object<T>(obj: T): T {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const key = JSON.stringify(obj);
        const found = cachedJSONObjectsMap?.get(key);
        if (found !== undefined) {
            return found;
        }

        if (obj instanceof Date) {
            return obj;
        }

        let newObj: any;

        if (Array.isArray(obj)) {
            newObj = obj.map(cachedJSONObjects.object);
            cachedJSONObjectsMap ??= new Map();
            cachedJSONObjectsMap.set(key, newObj);
            return newObj;
        }

        newObj = {};
        const record = obj as Record<string, unknown>;
        for (const k of Object.keys(obj)) {
            newObj[k] = cachedJSONObjects.object(record[k]);
        }
        cachedJSONObjectsMap ??= new Map();
        cachedJSONObjectsMap.set(key, newObj);
        return newObj;
    },

    /** return array.map(cachedJSONObjects.object) */
    array<T>(array: T[]): T[] {
        return array.map(cachedJSONObjects.object);
    },
};
