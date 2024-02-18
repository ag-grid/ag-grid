interface BBoxLike {
    width: number;
    height: number;
    containsPoint(x: number, y: number): boolean;
}
export interface BBoxProvider {
    computeBBox(): BBoxLike | undefined;
}
export declare class BBoxSet<V> {
    private nodes;
    add(value: V, bbox: BBoxProvider): void;
    find(x: number, y: number): V[];
    [Symbol.iterator](): IterableIterator<V>;
    clear(): void;
}
export {};
