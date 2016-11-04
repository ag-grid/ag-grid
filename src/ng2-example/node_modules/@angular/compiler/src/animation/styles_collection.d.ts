export declare class StylesCollectionEntry {
    time: number;
    value: string | number;
    constructor(time: number, value: string | number);
    matches(time: number, value: string | number): boolean;
}
export declare class StylesCollection {
    styles: {
        [key: string]: StylesCollectionEntry[];
    };
    insertAtTime(property: string, time: number, value: string | number): void;
    getByIndex(property: string, index: number): StylesCollectionEntry;
    indexOfAtOrBeforeTime(property: string, time: number): number;
}
