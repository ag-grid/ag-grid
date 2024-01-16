/**
 * Zip two arrays into an object of keys and values, or an object of keys with a single value.
 */
export declare function zipObject<K, V>(keys: Array<K>, values: Array<V> | V): {
    [key: string]: V;
};
