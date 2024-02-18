export declare function partition<T, K>(items: T[], selector: (item: T) => K): Map<K, T[]>;
export declare function flatMap<T, V>(items: T[], iteratee: (item: T, index: number, array: T[]) => V[]): V[];
