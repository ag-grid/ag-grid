import { _, TextFormatter } from '@ag-grid-community/core';
import { ISetDisplayValueModel, SetFilterDisplayValue, SetFilterModelTreeItem } from './iSetDisplayValueModel';

export class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V> {
    private static readonly DATE_TREE_LIST_PATH_GETTER = (date: Date) => [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())];

    /** all displayed items in a tree structure */
    private allDisplayedItemsTree: SetFilterModelTreeItem[] = [];
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat: SetFilterModelTreeItem[] = [];

    private groupsExist: boolean;

    private selectAllItem: SetFilterModelTreeItem = {
        depth: 0,
        filterPasses: true,
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

    public updateDisplayedValuesToAllAvailable(getValue: (key: string | null) => V, availableKeys: Iterable<string | null>, fromMiniFilter?: boolean): void {
        if (fromMiniFilter) {
            this.resetFilter();
            this.updateExpandAll();
        } else {
            this.generateItemTree(getValue, availableKeys);
        }

        this.flattenItems();
    }

    public updateDisplayedValuesToMatchMiniFilter(
        getValue: (key: string | null) => V,
        availableKeys: Iterable<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        fromMiniFilter?: boolean
    ): void {
        // if it's just the mini filter being updated, we don't need to rebuild the full list of displayed items
        if (!fromMiniFilter) {
            this.generateItemTree(getValue, availableKeys);
        }

        this.updateFilter(matchesFilter, nullMatchesFilter);
        this.updateExpandAll();

        this.flattenItems();
    }

    private generateItemTree(getValue: (key: string | null) => V, availableKeys: Iterable<string | null>): void {
        this.allDisplayedItemsTree = [];
        this.groupsExist = false;
        
        const treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
        for (let key of availableKeys) {
            const value = getValue(key)!;
            const dataPath = treeListPathGetter(value) ?? [null];
            if (dataPath.length > 1) {
                this.groupsExist = true;
            }
            let children: SetFilterModelTreeItem[] | undefined = this.allDisplayedItemsTree;
            let item: SetFilterModelTreeItem | undefined;
            dataPath.forEach((treeKey, depth) => {
                if (!children) {
                    children = [];
                    item!.children = children;
                }
                item = children.find(child => child.treeKey?.toUpperCase() === treeKey?.toUpperCase());
                if (!item) {
                    item = { treeKey, depth, filterPasses: true, expanded: true };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.push(item);
                }
                children = item.children;
            });
        }

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
                if (!item.filterPasses) { return; }
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
            if (item.treeKey == null) {
                return nullMatchesFilter;
            }

            return matchesFilter(this.formatter(item.treeKey));
        };

        const recursiveFilterCheck = (item: SetFilterModelTreeItem, parentPasses: boolean) => {
            let atLeastOneChildPassed = false;
            if (item.children) {
                item.children.forEach(child => {
                    const childPasses = recursiveFilterCheck(child, parentPasses || passesFilter(item));
                    atLeastOneChildPassed = atLeastOneChildPassed || childPasses;
                });
            }

            const filterPasses = parentPasses || atLeastOneChildPassed || passesFilter(item);
            item.filterPasses = filterPasses;
            return filterPasses;
        };

        this.allDisplayedItemsTree.forEach(item => recursiveFilterCheck(item, false));
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
            for (const child of items) {
                if (!child.filterPasses || !child.children) {
                    continue;
                }
                someTrue = someTrue || !!child.expanded;
                someFalse = someFalse || !child.expanded;
                if (someTrue && someFalse) {
                    return undefined;
                }
                const childExpanded = recursiveExpansionCheck(child.children, someTrue, someFalse);
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
}