export declare class MultiIndexMap<K> {
    private indexes;
    private maps;
    constructor(...indexes: (keyof K)[]);
    getSize(): number;
    getBy(index: keyof K, key: any): K | undefined;
    set(item: K): void;
    delete(item: K): void;
    clear(): void;
    private getIterator;
    forEach(callback: (item: K) => void): void;
    find(callback: (item: K) => boolean): K | undefined;
    filter(predicate: (item: K) => boolean): K[];
}
