import { _ } from '@ag-grid-community/core';
import { SetFilterDisplayValue } from './iSetDisplayValueModel';
export class TreeSetDisplayValueModel {
    constructor(formatter, treeListPathGetter, treeListFormatter, treeDataOrGrouping) {
        this.formatter = formatter;
        this.treeListPathGetter = treeListPathGetter;
        this.treeListFormatter = treeListFormatter;
        this.treeDataOrGrouping = treeDataOrGrouping;
        /** all displayed items in a tree structure */
        this.allDisplayedItemsTree = [];
        /** all displayed items flattened and filtered */
        this.activeDisplayedItemsFlat = [];
        this.selectAllItem = {
            depth: 0,
            filterPasses: true,
            available: true,
            treeKey: SetFilterDisplayValue.SELECT_ALL,
            children: this.allDisplayedItemsTree,
            expanded: true,
            key: SetFilterDisplayValue.SELECT_ALL,
            parentTreeKeys: []
        };
    }
    ;
    updateDisplayedValuesToAllAvailable(getValue, allKeys, availableKeys, source) {
        if (source === 'reload') {
            this.generateItemTree(getValue, allKeys, availableKeys);
        }
        else if (source === 'otherFilter') {
            this.updateAvailable(availableKeys);
            this.updateExpandAll();
        }
        else if (source === 'miniFilter') {
            this.resetFilter();
            this.updateExpandAll();
        }
        this.flattenItems();
    }
    updateDisplayedValuesToMatchMiniFilter(getValue, allKeys, availableKeys, matchesFilter, nullMatchesFilter, source) {
        if (source === 'reload') {
            this.generateItemTree(getValue, allKeys, availableKeys);
        }
        else if (source === 'otherFilter') {
            this.updateAvailable(availableKeys);
        }
        this.updateFilter(matchesFilter, nullMatchesFilter);
        this.updateExpandAll();
        this.flattenItems();
    }
    generateItemTree(getValue, allKeys, availableKeys) {
        var _a;
        this.allDisplayedItemsTree = [];
        this.groupsExist = false;
        const treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
        for (let key of allKeys) {
            const value = getValue(key);
            const dataPath = (_a = treeListPathGetter(value)) !== null && _a !== void 0 ? _a : [null];
            if (dataPath.length > 1) {
                this.groupsExist = true;
            }
            const available = availableKeys.has(key);
            let children = this.allDisplayedItemsTree;
            let item;
            let parentTreeKeys = [];
            dataPath.forEach((treeKey, depth) => {
                if (!children) {
                    children = [];
                    item.children = children;
                }
                item = children.find(child => { var _a; return ((_a = child.treeKey) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === (treeKey === null || treeKey === void 0 ? void 0 : treeKey.toUpperCase()); });
                if (!item) {
                    item = { treeKey, depth, filterPasses: true, expanded: false, available, parentTreeKeys };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.push(item);
                }
                children = item.children;
                parentTreeKeys = [...parentTreeKeys, treeKey];
            });
        }
        // update the parent availability based on the children
        this.updateAvailable(availableKeys);
        this.selectAllItem.children = this.allDisplayedItemsTree;
        this.selectAllItem.expanded = false;
    }
    getTreeListPathGetter(getValue, availableKeys) {
        if (this.treeListPathGetter) {
            return this.treeListPathGetter;
        }
        if (this.treeDataOrGrouping) {
            return value => value;
        }
        // infer from data
        let isDate = false;
        for (const availableKey of availableKeys) {
            // find the first non-null value
            const value = getValue(availableKey);
            if (value instanceof Date) {
                isDate = true;
                break;
            }
            else if (value != null) {
                break;
            }
        }
        if (isDate) {
            return TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER;
        }
        _.doOnce(() => console.warn('AG Grid: property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date.'), 'getTreeListPathGetter');
        return value => [String(value)];
    }
    flattenItems() {
        this.activeDisplayedItemsFlat = [];
        const recursivelyFlattenDisplayedItems = (items) => {
            items.forEach(item => {
                if (!item.filterPasses || !item.available) {
                    return;
                }
                this.activeDisplayedItemsFlat.push(item);
                if (item.children && item.expanded) {
                    recursivelyFlattenDisplayedItems(item.children);
                }
            });
        };
        recursivelyFlattenDisplayedItems(this.allDisplayedItemsTree);
    }
    resetFilter() {
        const recursiveFilterReset = (item) => {
            if (item.children) {
                item.children.forEach(child => {
                    recursiveFilterReset(child);
                });
            }
            item.filterPasses = true;
        };
        this.allDisplayedItemsTree.forEach(item => recursiveFilterReset(item));
    }
    updateFilter(matchesFilter, nullMatchesFilter) {
        const passesFilter = (item) => {
            if (!item.available) {
                return false;
            }
            if (item.treeKey == null) {
                return nullMatchesFilter;
            }
            return matchesFilter(this.formatter(this.treeListFormatter ? this.treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys) : item.treeKey));
        };
        this.allDisplayedItemsTree.forEach(item => this.recursiveItemCheck(item, false, passesFilter, 'filterPasses'));
    }
    getDisplayedValueCount() {
        return this.activeDisplayedItemsFlat.length;
    }
    getDisplayedItem(index) {
        return this.activeDisplayedItemsFlat[index];
    }
    getSelectAllItem() {
        return this.selectAllItem;
    }
    getDisplayedKeys() {
        const displayedKeys = [];
        this.forEachDisplayedKey((key) => displayedKeys.push(key));
        return displayedKeys;
    }
    forEachDisplayedKey(func) {
        const recursiveForEachItem = (item, topParentExpanded) => {
            if (item.children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    item.children.forEach(child => {
                        if (child.filterPasses) {
                            recursiveForEachItem(child, false);
                        }
                    });
                }
            }
            else {
                func(item.key);
            }
        };
        this.activeDisplayedItemsFlat.forEach(item => recursiveForEachItem(item, true));
    }
    someDisplayedKey(func) {
        const recursiveSomeItem = (item, topParentExpanded) => {
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
            }
            else {
                return func(item.key);
            }
            return false;
        };
        return this.activeDisplayedItemsFlat.some(item => recursiveSomeItem(item, true));
    }
    hasGroups() {
        return this.groupsExist;
    }
    refresh() {
        this.updateExpandAll();
        this.flattenItems();
    }
    updateExpandAll() {
        const recursiveExpansionCheck = (items, someTrue, someFalse) => {
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
                }
                else if (childExpanded) {
                    someTrue = true;
                }
                else {
                    someFalse = true;
                }
            }
            return someTrue && someFalse ? undefined : someTrue;
        };
        const item = this.getSelectAllItem();
        item.expanded = recursiveExpansionCheck(item.children, false, false);
    }
    recursiveItemCheck(item, parentPasses, checkFunction, itemProp) {
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
    updateAvailable(availableKeys) {
        const isAvailable = (item) => availableKeys.has(item.key);
        this.allDisplayedItemsTree.forEach(item => this.recursiveItemCheck(item, false, isAvailable, 'available'));
    }
}
TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER = (date) => date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVNldERpc3BsYXlWYWx1ZU1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci90cmVlU2V0RGlzcGxheVZhbHVlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBaUIsTUFBTSx5QkFBeUIsQ0FBQztBQUMzRCxPQUFPLEVBQXlCLHFCQUFxQixFQUEwQixNQUFNLHlCQUF5QixDQUFDO0FBRS9HLE1BQU0sT0FBTyx3QkFBd0I7SUFxQmpDLFlBQ3FCLFNBQXdCLEVBQ3hCLGtCQUF5RCxFQUN6RCxpQkFBd0csRUFDeEcsa0JBQTRCO1FBSDVCLGNBQVMsR0FBVCxTQUFTLENBQWU7UUFDeEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUF1QztRQUN6RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVGO1FBQ3hHLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBVTtRQXRCakQsOENBQThDO1FBQ3RDLDBCQUFxQixHQUE2QixFQUFFLENBQUM7UUFDN0QsaURBQWlEO1FBQ3pDLDZCQUF3QixHQUE2QixFQUFFLENBQUM7UUFJL0Msa0JBQWEsR0FBMkI7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFDUixZQUFZLEVBQUUsSUFBSTtZQUNsQixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxVQUFVO1lBQ3pDLFFBQVEsRUFBRSxJQUFJLENBQUMscUJBQXFCO1lBQ3BDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsR0FBRyxFQUFFLHFCQUFxQixDQUFDLFVBQVU7WUFDckMsY0FBYyxFQUFFLEVBQUU7U0FDckIsQ0FBQztJQU9DLENBQUM7SUFBQSxDQUFDO0lBRUUsbUNBQW1DLENBQ3RDLFFBQTBDLEVBQzFDLE9BQTRDLEVBQzVDLGFBQWlDLEVBQ2pDLE1BQStDO1FBRS9DLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUNyQixJQUFJLENBQUMsZ0JBQWdCLENB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