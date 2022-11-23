import { TextFormatter } from '@ag-grid-community/core';
import { ISetDisplayValueModel } from './iSetDisplayValueModel';

export interface SetFilterModelTreeItem {
    treeKey: string | null;
    depth: number;
    filterPasses: boolean;
    expanded?: boolean;
    children?: SetFilterModelTreeItem[];
    key?: string | null;
}

export class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V, SetFilterModelTreeItem> {
    /** all displayed items in a tree structure */
    private allDisplayedItemsTree: SetFilterModelTreeItem[] = [];
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat: SetFilterModelTreeItem[] = [];

    private groupsExist: boolean;

    constructor(
        private readonly getDataPath: (value: V) => (string | null)[],
        private readonly formatter: TextFormatter
    ) {};

    public updateDisplayedValuesToAllAvailable(allValues: Map<string | null, V | null>, availableKeys: Set<string | null>): void {
        this.generateItemTree(allValues, availableKeys);

        this.flattenItems();
    }

    public updateDisplayedValuesToMatchMiniFilter(
        allValues: Map<string | null, V | null>,
        availableKeys: Set<string | null>,
        matchesFilter: (valueToCheck: string | null) => boolean,
        nullMatchesFilter: boolean,
        fromMiniFilter?: boolean
    ): void {
        // if it's just the mini filter being updated, we don't need to rebuild the full list of displayed items
        if (!fromMiniFilter) {
            this.generateItemTree(allValues, availableKeys);
        }

        this.updateFilter(matchesFilter, nullMatchesFilter);

        this.flattenItems();
    }

    private generateItemTree(allValues: Map<string | null, V | null>, availableKeys: Set<string | null>): void {
        this.allDisplayedItemsTree = [];
        this.groupsExist = false;
        availableKeys.forEach(key => {
            const value = allValues.get(key)!;
            const dataPath = this.getDataPath(value) ?? [null];
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
                item = children.find(child => child.treeKey === treeKey);
                if (!item) {
                    item = { treeKey, depth, filterPasses: true, expanded: true };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.push(item);
                }
                children = item.children;
            })
        });
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

    private updateFilter(matchesFilter: (valueToCheck: string | null) => boolean, nullMatchesFilter: boolean) {
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
 
    public getDisplayedKey(index: number): SetFilterModelTreeItem | null {
        return this.activeDisplayedItemsFlat[index];
    }
 
    public getDisplayedKeys(): (string | null)[] {
        return this.activeDisplayedItemsFlat.map(({ treeKey }) => treeKey);
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
        this.flattenItems();
    }
}