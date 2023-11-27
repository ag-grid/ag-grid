export declare function extent(values: Array<number | Date>): [number, number] | undefined;
export declare function normalisedExtent(d: number[], min: number, max: number): number[];
export declare function normalisedExtentWithMetadata(d: number[], min: number, max: number): {
    extent: number[];
    clipped: boolean;
};
export declare function arraysEqual(a: any[], b: any[]): boolean;
export declare function toArray<T>(value: T): T[];
