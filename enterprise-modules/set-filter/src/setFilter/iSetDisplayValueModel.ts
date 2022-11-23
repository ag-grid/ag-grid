export interface ISetDisplayValueModel<V, K> {
    updateDisplayedValuesToAllAvailable(allValues: Map<string | null, V | null>, availableKeys: Set<string | null>): void;

    updateDisplayedValuesToMatchMiniFilter(
        allValues: Map<string | null, V | null>,
        availableKeys: Set<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        fromMiniFilter?: boolean
    ): void;

    getDisplayedValueCount(): number;

    getDisplayedKey(index: number): K | null;

    getDisplayedKeys(): (string | null)[];

    forEachDisplayedKey(func: (key: string | null) => void): void;

    someDisplayedKey(func: (key: string | null) => boolean): boolean;

    hasGroups(): boolean;

    refresh(): void;
}