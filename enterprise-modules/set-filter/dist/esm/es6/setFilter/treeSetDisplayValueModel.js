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
        return this.activeDisplayedItemsFlat.map(({ treeKey }) => treeKey);
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
