import { _, TextFormatter } from '@ag-grid-community/core';
import { ISetDisplayValueModel, SetFilterDisplayValue, SetFilterModelTreeItem } from './iSetDisplayValueModel';

export class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V> {
    private static readonly DATE_TREE_LIST_PATH_GETTER = (date: Date) => [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())];

    /** all displayed items in a tree structure */
    private allDisplayedItemsTree: SetFilterModelTreeItem[] = [];
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat: SetFilterModelTreeItem[] = [];

    private groupsExist: boolean;

    private readonly selectAllItem: SetFilterModelTreeItem = {
        depth: 0,
        filterPasses: true,
        available: true,
        treeKey: SetFilterDisplayValue.SELECT_ALL,
        children: this.allDisplayedItemsTree,
        expanded: true,
        key: SetFilterDisplayValue.SELECT_ALL,
    };

    constructor(
        private readonly formatter: TextFormatter,
        private readonly treeListPathGetter?: (value: V) => (string | null)[],
        private readonly treeDataOrGrouping?: boolean
    ) {};

    public updateDisplayedValuesToAllAvailable(
        getValue: (key: string | null) => V,
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
        getValue: (key: string | null) => V,
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

    private generateItemTree(getValue: (key: string | null) => V, allKeys: Iterable<string | null>, availableKeys: Set<string | null>): void {
        this.allDisplayedItemsTree = [];
        this.groupsExist = false;
        
        const treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
        for (let key of allKeys) {
            const value = getValue(key)!;
            const dataPath = treeListPathGetter(value) ?? [null];
            if (dataPath.length > 1) {
                this.groupsExist = true;
            }
            const available = availableKeys.has(key);
            let children: SetFilterModelTreeItem[] | undefined = this.allDisplayedItemsTree;
            let item: SetFilterModelTreeItem | undefined;
            dataPath.forEach((treeKey, depth) => {
                if (!children) {
                    children = [];
                    item!.children = children;
                }
                item = children.find(child => child.treeKey?.toUpperCase() === treeKey?.toUpperCase());
                if (!item) {
                    item = { treeKey, depth, filterPasses: true, expanded: true, available };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.push(item);
                }
                children = item.children;
            });
        }
        // update the parent availability based on the children
        this.updateAvailable(availableKeys);

        this.selectAllItem.children = this.allDisplayedItemsTree;
        this.selectAllItem.expanded = true;
    }

    private getTreeListPathGetter(getValue: (key: string | null) => V, availableKeys: Iterable<string | null>): (value: V) => (string | null)[] {
        if (this.treeListPathGetter) {
            return this.treeListPathGetter;
        }
        if (this.treeDataOrGrouping) {
            return value => value as any;
        }
        // infer from data
        const firstValue = getValue(availableKeys[Symbol.iterator]().next().value);
        if (firstValue instanceof Date) {
            return TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER as any;
        }
        _.doOnce(
            () => console.warn('AG Grid: property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date.'),
            'getTreeListPathGetter'
        );
        return value => [String(value)];
    }

    private flattenItems(): void {
        this.activeDisplayedItemsFlat = [];
        const recursivelyFlattenDisplayedItems = (items: SetFilterModelTreeItem[]) => {
            items.forEach(item => {
                if (!item.filterPasses || !item.available) { return; }
                this.activeDisplayedItemsFlat.push(item);
                if (item.children && item.expanded) {
                    recursivelyFlattenDisplayedItems(item.children)
                }
            });
        };
        recursivelyFlattenDisplayedItems(this.allDisplayedItemsTree);
    }

    private resetFilter(): void {
        const recursiveFilterReset = (item: SetFilterModelTreeItem) => {
            if (item.children) {
                item.children.forEach(child => {
                    recursiveFilterReset(child);
                });
            }

            item.filterPasses = true;
        };

        this.allDisplayedItemsTree.forEach(item => recursiveFilterReset(item));
    }

    private updateFilter(matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean): void {
        const passesFilter = (item: SetFilterModelTreeItem) => {
            if (!item.available) {
                return false;
            }
            if (item.treeKey == null) {
                return nullMatchesFilter;
            }

            return matchesFilter(this.formatter(item.treeKey));
        };

        this.allDisplayedItemsTree.forEach(item => this.recursiveItemCheck(item, false, passesFilter, 'filterPasses'));
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
 
    public getDisplayedKeys(): (string | null)[] {
        return this.activeDisplayedItemsFlat.map(({ treeKey }) => treeKey) as any;
    }

    public forEachDisplayedKey(func: (key: string | null) => void): void {
        const recursiveForEachItem = (item: SetFilterModelTreeItem, topParentExpanded: boolean) => {
            if (item.children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    item.children.forEach(child => {
                        if (child.filterPasses) {
                            recursiveForEachItem(child, false);
                        }
                    });
                }
            } else {
                func(item.key!);
            }
        };

        this.activeDisplayedItemsFlat.forEach(item => recursiveForEachItem(item, true));
    }

    public someDisplayedKey(func: (key: string | null) => boolean): boolean {
        const recursiveSomeItem = (item: SetFilterModelTreeItem, topParentExpanded: boolean): boolean => {
            if (item.children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    return item.children.some(child => {
                        if (child.filterPasses) {
                            return recursiveSomeItem(child, false);
                        }
                        return false;
                    });
                }
            } else {
                return func(item.key!);
            }
            return false;
        };

        return this.activeDisplayedItemsFlat.some(item => recursiveSomeItem(item, true));
    }

    public hasGroups(): boolean {
        return this.groupsExist;
    }

    public refresh(): void {
        this.updateExpandAll();
        this.flattenItems();
    }

    private updateExpandAll(): void {
        const recursiveExpansionCheck = (items: SetFilterModelTreeItem[], someTrue: boolean, someFalse: boolean): boolean | undefined => {
            for (const item of items) {
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
            if (item.children) {
                item.children.forEach(child => {
                    const childPasses = this.recursiveItemCheck(child, parentPasses || checkFunction(item), checkFunction, itemProp);
                    atLeastOneChildPassed = atLeastOneChildPassed || childPasses;
                });
            }

            const itemPasses = parentPasses || atLeastOneChildPassed || checkFunction(item);
            item[itemProp] = itemPasses;
            return itemPasses;
    }

    private updateAvailable(availableKeys: Set<string | null>) {
        const isAvailable = (item: SetFilterModelTreeItem) => availableKeys.has(item.key!);

        this.allDisplayedItemsTree.forEach(item => this.recursiveItemCheck(item, false, isAvailable, 'available'));
    }
}