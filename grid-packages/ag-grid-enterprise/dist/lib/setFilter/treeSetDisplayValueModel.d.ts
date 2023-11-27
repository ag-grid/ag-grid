import { TextFormatter } from 'ag-grid-community';
import { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';
export declare class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V> {
    private readonly formatter;
    private readonly treeListPathGetter?;
    private readonly treeListFormatter?;
    private readonly treeDataOrGrouping?;
    private static readonly DATE_TREE_LIST_PATH_GETTER;
    /** all displayed items in a tree structure */
    private allDisplayedItemsTree;
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat;
    private groupsExist;
    private readonly selectAllItem;
    private readonly addSelectionToFilterItem;
    constructor(formatter: TextFormatter, treeListPathGetter?: ((value: V | null) => string[] | null) | undefined, treeListFormatter?: ((pathKey: string | null, level: number, parentPathKeys: (string | null)[]) => string) | undefined, treeDataOrGrouping?: boolean | undefined);
    updateDisplayedValuesToAllAvailable(getValue: (key: string | null) => V | null, allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>, source: 'reload' | 'otherFilter' | 'miniFilter'): void;
    updateDisplayedValuesToMatchMiniFilter(getValue: (key: string | null) => V | null, allKeys: Iterable<string | null> | undefined, availableKeys: Set<string | null>, matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean, source: 'reload' | 'otherFilter' | 'miniFilter'): void;
    private generateItemTree;
    private getTreeListPathGetter;
    private flattenItems;
    private resetFilter;
    private updateFilter;
    getDisplayedValueCount(): number;
    getDisplayedItem(index: number): SetFilterModelTreeItem | null;
    getSelectAllItem(): SetFilterModelTreeItem;
    getAddSelectionToFilterItem(): string | SetFilterModelTreeItem;
    getDisplayedKeys(): (string | null)[];
    forEachDisplayedKey(func: (key: string | null) => void): void;
    someDisplayedKey(func: (key: string | null) => boolean): boolean;
    hasGroups(): boolean;
    refresh(): void;
    private updateExpandAll;
    private recursiveItemCheck;
    private updateAvailable;
}
