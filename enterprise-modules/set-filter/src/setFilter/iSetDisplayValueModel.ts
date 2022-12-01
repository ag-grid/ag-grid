export interface ISetDisplayValueModel<V> {
    updateDisplayedValuesToAllAvailable(getValue: (key: string | null) => V, availableKeys: Iterable<string | null>): void;

    updateDisplayedValuesToMatchMiniFilter(
        getValue: (key: string | null) => V,
        availableKeys: Iterable<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        fromMiniFilter?: boolean
    ): void;

    getDisplayedValueCount(): number;

    getDisplayedItem(index: number): string | SetFilterModelTreeItem | null;

    getDisplayedKeys(): (string | null)[];

    forEachDisplayedKey(func: (key: string | null) => void): void;

    someDisplayedKey(func: (key: string | null) => boolean): boolean;

    hasGroups(): boolean;

    refresh(): void;
}

export interface SetFilterModelTreeItem {
    treeKey: string | null;
    depth: number;
    filterPasses: boolean;
    expanded?: boolean;
    children?: SetFilterModelTreeItem[];
    key?: string | null;
}
