import { _, TextFormatter } from '@ag-grid-community/core';
import { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';

export class TreeSetDisplayValueModel<V> implements ISetDisplayValueModel<V, SetFilterModelTreeItem> {
    private static readonly DATE_TREE_LIST_PATH_GETTER = (date: Date) => [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())];

    /** all displayed items in a tree structure */
    private allDisplayedItemsTree: SetFilterModelTreeItem[] = [];
    /** all displayed items flattened and filtered */
    private activeDisplayedItemsFlat: SetFilterModelTreeItem[] = [];

    private groupsExist: boolean;

    constructor(
        private readonly formatter: TextFormatter,
        private readonly treeListPathGetter?: (value: V) => (string | null)[]
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
        
        const treeListPathGetter = this.getTreeListPathGetter(allValues);
        availableKeys.forEach(key => {
            const value = allValues.get(key)!;
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

    private getTreeListPathGetter(allValues: Map<string | null, V | null>): (value: V) => (string | null)[] {
        if (this.treeListPathGetter) {
            return this.treeListPathGetter;
        }
        if (/** tree data mode */false) {
            // TODO - tree data version
        }
        if (/** normal grouping */false) {
            // TODO - grouping version
        }
        // infer from data
        const firstValue = allValues.values().next().value;
        if (firstValue instanceof Date) {
            return TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER as any;
        }
        _.doOnce(
            () => console.warn('AG Grid: property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date.'),
            'getTreeListPathGetter'
        );
        return (value) => [String(value)];
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