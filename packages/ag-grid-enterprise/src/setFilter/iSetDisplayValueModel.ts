export interface ISetDisplayValueModel<V> {
    updateDisplayedValuesToAllAvailable(
        getValue: (key: string | null) => V | null,
        allKeys: Iterable<string | null> | undefined,
        availableKeys: Set<string | null>,
        source: 'reload' | 'otherFilter' | 'miniFilter'
    ): void;

    updateDisplayedValuesToMatchMiniFilter(
        getValue: (key: string | null) => V | null,
        allKeys: Iterable<string | null> | undefined,
        availableKeys: Set<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        source: 'reload' | 'otherFilter' | 'miniFilter'
    ): void;

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

export const SET_FILTER_SELECT_ALL = '__AG_SELECT_ALL__';
export const SET_FILTER_ADD_SELECTION_TO_FILTER = '__AG_ADD_SELECTION_TO_FILTER__';

/** Read `keys` through this, so a group with none loops zero times instead of every reader testing for it. */
export const NO_SET_FILTER_KEYS: readonly (string | null)[] = [];

export type SetFilterTreeListFormatter = (
    pathKey: string | null,
    level: number,
    parentPathKeys: (string | null)[]
) => string;

/** Path nodes are keyed by their upper-cased tree key; a value known only by its key is keyed by its own item. */
export type SetFilterTreeItems = Map<string | null | SetFilterModelTreeItem, SetFilterModelTreeItem>;

export interface SetFilterModelTreeItem {
    treeKey: string | null;
    depth: number;
    filterPasses: boolean;
    available: boolean;
    expanded?: boolean;
    children?: SetFilterTreeItems;
    keys?: (string | null)[];
    parentTreeKeys: (string | null)[];
    /** A leaf for a value known only by its key, which has no value to format or render. */
    keyOnly?: boolean;
}
