import type { TextFormatter } from 'ag-grid-community';
import { _getDateParts, _warn } from 'ag-grid-community';

import type { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { SET_FILTER_ADD_SELECTION_TO_FILTER, SET_FILTER_SELECT_ALL } from './iSetDisplayValueModel';

export class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V> {
    /** all displayed items in a tree structure */
    private allDisplayedItemsTree: Map<string | null, SetFilterModelTreeItem> = new Map();
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat: SetFilterModelTreeItem[] = [];

    private groupsExist: boolean;

    private readonly selectAllItem: SetFilterModelTreeItem = {
        depth: 0,
        filterPasses: true,
        available: true,
        treeKey: SET_FILTER_SELECT_ALL,
        children: this.allDisplayedItemsTree,
        expanded: true,
        key: SET_FILTER_SELECT_ALL,
        parentTreeKeys: [],
    };

    private readonly addSelectionToFilterItem: SetFilterModelTreeItem = {
        depth: 0,
        filterPasses: true,
        available: true,
        treeKey: SET_FILTER_ADD_SELECTION_TO_FILTER,
        expanded: true,
        key: SET_FILTER_ADD_SELECTION_TO_FILTER,
        parentTreeKeys: [],
    };

    constructor(
        private readonly formatter: TextFormatter,
        private treeListPathGetter?: (value: V | null) => string[] | null,
        private treeListFormatter?: (
            pathKey: string | null,
            level: number,
            parentPathKeys: (string | null)[]
        ) => string,
        private readonly treeDataOrGrouping?: boolean
    ) {}

    public updateParams(
        treeListPathGetter?: (value: V | null) => string[] | null,
        treeListFormatter?: (pathKey: string | null, level: number, parentPathKeys: (string | null)[]) => string
    ) {
        this.treeListPathGetter = treeListPathGetter;
        this.treeListFormatter = treeListFormatter;
    }

    public updateDisplayedValuesToAllAvailable(
        getValue: (key: string | null) => V | null,
        allKeys: Iterable<string | null> | undefined,
        availableKeys: Set<string | null>,
        source: 'reload' | 'otherFilter' | 'miniFilter'
    ): void {
        if (source === 'reload') {
            this.generateItemTree(getValue, allKeys!, availableKeys);
        } else if (source === 'otherFilter') {
            this.updateAvailable(availableKeys);
            this.updateExpandAll();
        } else if (source === 'miniFilter') {
            this.resetFilter();
            this.updateExpandAll();
        }

        this.flattenItems();
    }

    public updateDisplayedValuesToMatchMiniFilter(
        getValue: (key: string | null) => V | null,
        allKeys: Iterable<string | null> | undefined,
        availableKeys: Set<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        source: 'reload' | 'otherFilter' | 'miniFilter'
    ): void {
        if (source === 'reload') {
            this.generateItemTree(getValue, allKeys!, availableKeys);
        } else if (source === 'otherFilter') {
            this.updateAvailable(availableKeys);
        }

        this.updateFilter(matchesFilter, nullMatchesFilter);
        this.updateExpandAll();

        this.flattenItems();
    }

    private generateItemTree(
        getValue: (key: string | null) => V | null,
        allKeys: Iterable<string | null>,
        availableKeys: Set<string | null>
    ): void {
        const allDisplayedItemsTree = new Map<string | null, SetFilterModelTreeItem>();
        this.allDisplayedItemsTree = allDisplayedItemsTree;
        let groupsExist = false;

        const treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
        for (const key of allKeys) {
            const value = getValue(key)!;
            const dataPath = treeListPathGetter(value) ?? [null];
            const dataPathLength = dataPath.length;
            if (dataPathLength > 1) {
                groupsExist = true;
            }
            const available = availableKeys.has(key);
            let children: Map<string | null, SetFilterModelTreeItem> | undefined = allDisplayedItemsTree;
            let item: SetFilterModelTreeItem | undefined;
            let parentTreeKeys: (string | null)[] = [];
            for (let depth = 0; depth < dataPathLength; depth++) {
                const treeKey = dataPath[depth];
                if (!children) {
                    children = new Map();
                    item!.children = children;
                }
                const treeKeyUpper = treeKey?.toUpperCase() ?? null;
                item = children.get(treeKeyUpper);
                if (!item) {
                    item = {
                        treeKey,
                        depth,
                        filterPasses: true,
                        expanded: false,
                        available,
                        parentTreeKeys,
                    };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.set(treeKeyUpper, item);
                }
                children = item.children!;
                parentTreeKeys = [...parentTreeKeys, treeKey];
            }
        }
        this.groupsExist = groupsExist;
        // update the parent availability based on the children
        this.updateAvailable(availableKeys);

        this.selectAllItem.children = allDisplayedItemsTree;
        this.selectAllItem.expanded = false;
    }

    private getTreeListPathGetter(
        getValue: (key: string | null) => V | null,
        availableKeys: Set<string | null>
    ): NonNullable<typeof this.treeListPathGetter> {
        if (this.treeListPathGetter) {
            return this.treeListPathGetter;
        }
        if (this.treeDataOrGrouping) {
            return (value) => value as any;
        }
        // infer from data
        let isDate = false;
        for (const availableKey of availableKeys) {
            // find the first non-null value
            const value = getValue(availableKey);
            if (value instanceof Date) {
                isDate = true;
                break;
            } else if (value != null) {
                break;
            }
        }
        if (isDate) {
            return (value) => _getDateParts(value as Date, false); // if user wants time, they can provide a treeListPathGetter as mentioned in Docs
        }
        _warn(211);
        return (value) => [String(value)];
    }

    private flattenItems(): void {
        this.activeDisplayedItemsFlat = [];
        const recursivelyFlattenDisplayedItems = (items: Map<string | null, SetFilterModelTreeItem>) => {
            for (const item of items.values()) {
                if (!item.filterPasses || !item.available) {
                    continue;
                }
                this.activeDisplayedItemsFlat.push(item);
                if (item.children && item.expanded) {
                    recursivelyFlattenDisplayedItems(item.children);
                }
            }
        };
        recursivelyFlattenDisplayedItems(this.allDisplayedItemsTree);
    }

    private resetFilter(): void {
        const recursiveFilterReset = (item: SetFilterModelTreeItem) => {
            const children = item.children;
            if (children) {
                for (const child of children.values()) {
                    recursiveFilterReset(child);
                }
            }

            item.filterPasses = true;
        };

        for (const item of this.allDisplayedItemsTree.values()) {
            recursiveFilterReset(item);
        }
    }

    private updateFilter(matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean): void {
        const passesFilter = (item: SetFilterModelTreeItem) => {
            if (!item.available) {
                return false;
            }
            if (item.treeKey == null) {
                return nullMatchesFilter;
            }

            return matchesFilter(
                this.formatter(
                    this.treeListFormatter
                        ? this.treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys)
                        : item.treeKey
                )
            );
        };

        for (const item of this.allDisplayedItemsTree.values()) {
            this.recursiveItemCheck(item, false, passesFilter, 'filterPasses');
        }
    }

    public getDisplayedValueCount(): number {
        return this.activeDisplayedItemsFlat.length;
    }

    public getDisplayedItem(index: number): SetFilterModelTreeItem | null {
        return this.activeDisplayedItemsFlat[index];
    }

    public getSelectAllItem(): SetFilterModelTreeItem {
        return this.selectAllItem;
    }

    public getAddSelectionToFilterItem(): string | SetFilterModelTreeItem {
        return this.addSelectionToFilterItem;
    }

    public getDisplayedKeys(): (string | null)[] {
        const displayedKeys: (string | null)[] = [];
        this.forEachDisplayedKey((key) => displayedKeys.push(key));
        return displayedKeys;
    }

    public forEachDisplayedKey(func: (key: string | null) => void): void {
        const recursiveForEachItem = (item: SetFilterModelTreeItem, topParentExpanded: boolean) => {
            const children = item.children;
            if (children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    for (const child of children.values()) {
                        if (child.filterPasses) {
                            recursiveForEachItem(child, false);
                        }
                    }
                }
            } else {
                func(item.key!);
            }
        };

        this.activeDisplayedItemsFlat.forEach((item) => recursiveForEachItem(item, true));
    }

    public someDisplayedKey(func: (key: string | null) => boolean): boolean {
        const recursiveSomeItem = (item: SetFilterModelTreeItem, topParentExpanded: boolean): boolean => {
            const children = item.children;
            if (children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    for (const child of children.values()) {
                        if (child.filterPasses && recursiveSomeItem(child, false)) {
                            return true;
                        }
                    }
                    return false;
                }
            } else {
                return func(item.key!);
            }
            return false;
        };

        return this.activeDisplayedItemsFlat.some((item) => recursiveSomeItem(item, true));
    }

    public hasGroups(): boolean {
        return this.groupsExist;
    }

    public refresh(): void {
        this.updateExpandAll();
        this.flattenItems();
    }

    private updateExpandAll(): void {
        const recursiveExpansionCheck = (
            items: Map<string | null, SetFilterModelTreeItem>,
            someTrue: boolean,
            someFalse: boolean
        ): boolean | undefined => {
            for (const item of items.values()) {
                if (!item.filterPasses || !item.available || !item.children) {
                    continue;
                }
                // indeterminate state only exists for expand all, so don't need to check for the current item
                someTrue = someTrue || !!item.expanded;
                someFalse = someFalse || !item.expanded;
                if (someTrue && someFalse) {
                    // already indeterminate. No need to check the children
                    return undefined;
                }
                const childExpanded = recursiveExpansionCheck(item.children, someTrue, someFalse);
                if (childExpanded === undefined) {
                    return undefined;
                } else if (childExpanded) {
                    someTrue = true;
                } else {
                    someFalse = true;
                }
            }
            return someTrue && someFalse ? undefined : someTrue;
        };

        const item = this.getSelectAllItem();
        item.expanded = recursiveExpansionCheck(item.children!, false, false);
    }

    private recursiveItemCheck(
        item: SetFilterModelTreeItem,
        parentPasses: boolean,
        checkFunction: (item: SetFilterModelTreeItem) => boolean,
        itemProp: 'filterPasses' | 'available'
    ): boolean {
        let atLeastOneChildPassed = false;
        const children = item.children;
        if (children) {
            for (const child of children.values()) {
                const childPasses = this.recursiveItemCheck(
                    child,
                    parentPasses || checkFunction(item),
                    checkFunction,
                    itemProp
                );
                atLeastOneChildPassed = atLeastOneChildPassed || childPasses;
            }
        }

        const itemPasses = parentPasses || atLeastOneChildPassed || checkFunction(item);
        item[itemProp] = itemPasses;
        return itemPasses;
    }

    private updateAvailable(availableKeys: Set<string | null>) {
        const isAvailable = (item: SetFilterModelTreeItem) => availableKeys.has(item.key!);

        for (const item of this.allDisplayedItemsTree.values()) {
            this.recursiveItemCheck(item, false, isAvailable, 'available');
        }
    }
}
