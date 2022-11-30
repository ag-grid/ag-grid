export interface ISetDisplayValueModel<K extends string | string[], V> {
    updateDisplayedValuesToAllAvailable(getValue: (key: K | null) => V, availableKeys: Iterable<K | null>): void;

    updateDisplayedValuesToMatchMiniFilter(
        getValue: (key: K | null) => V,
        availableKeys: Iterable<K | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        fromMiniFilter?: boolean
    ): void;

    getDisplayedValueCount(): number;

    getDisplayedItem(index: number): K | SetFilterModelTreeItem<K> | null;

    getDisplayedKeys(): (K | null)[];

    forEachDisplayedKey(func: (key: K | null) => void): void;

    someDisplayedKey(func: (key: K | null) => boolean): boolean;

    hasGroups(): boolean;

    refresh(): void;
}

export interface SetFilterModelTreeItem<K> {
    treeKey: string | null;
    depth: number;
    filterPasses: boolean;
    expanded?: boolean;
    children?: SetFilterModelTreeItem<K>[];
    key?: K | null;
}
