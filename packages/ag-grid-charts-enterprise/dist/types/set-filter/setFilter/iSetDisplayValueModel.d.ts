export interface ISetDisplayValueModel<V> {
    updateDisplayedValuesToAllAvailable(getValue: (key: string | null) => V | null, allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>, source: 'reload' | 'otherFilter' | 'miniFilter'): void;
    updateDisplayedValuesToMatchMiniFilter(getValue: (key: string | null) => V | null, allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>, matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean, source: 'reload' | 'otherFilter' | 'miniFilter'): void;
    getDisplayedValueCount(): number;
    getDisplayedItem(index: number): string | SetFilterModelTreeItem | null;
    getSelectAllItem(): string | SetFilterModelTreeItem;
    getAddSelectionToFilterItem(): string | SetFilterModelTreeItem;
    getDisplayedKeys(): (string | null)[];
    forEachDisplayedKey(func: (key: string | null) => void): void;
    someDisplayedKey(func: (key: string | null) => boolean): boolean;
    hasGroups(): boolean;
    refresh(): void;
}
export declare class SetFilterDisplayValue {
    static readonly SELECT_ALL = "__AG_SELECT_ALL__";
    static readonly ADD_SELECTION_TO_FILTER = "__AG_ADD_SELECTION_TO_FILTER__";
}
export interface SetFilterModelTreeItem {
    treeKey: string | null;
    depth: number;
    filterPasses: boolean;
    available: boolean;
    expanded?: boolean;
    children?: SetFilterModelTreeItem[];
    key?: string | null;
    parentTreeKeys: (string | null)[];
}
