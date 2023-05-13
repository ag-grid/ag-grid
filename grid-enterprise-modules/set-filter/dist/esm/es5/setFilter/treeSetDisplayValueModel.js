var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { _ } from '@ag-grid-community/core';
import { SetFilterDisplayValue } from './iSetDisplayValueModel';
var TreeSetDisplayValueModel = /** @class */ (function () {
    function TreeSetDisplayValueModel(formatter, treeListPathGetter, treeListFormatter, treeDataOrGrouping) {
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
    TreeSetDisplayValueModel.prototype.updateDisplayedValuesToAllAvailable = function (getValue, allKeys, availableKeys, source) {
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
    };
    TreeSetDisplayValueModel.prototype.updateDisplayedValuesToMatchMiniFilter = function (getValue, allKeys, availableKeys, matchesFilter, nullMatchesFilter, source) {
        if (source === 'reload') {
            this.generateItemTree(getValue, allKeys, availableKeys);
        }
        else if (source === 'otherFilter') {
            this.updateAvailable(availableKeys);
        }
        this.updateFilter(matchesFilter, nullMatchesFilter);
        this.updateExpandAll();
        this.flattenItems();
    };
    TreeSetDisplayValueModel.prototype.generateItemTree = function (getValue, allKeys, availableKeys) {
        var e_1, _a;
        var _b;
        this.allDisplayedItemsTree = [];
        this.groupsExist = false;
        var treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
        var _loop_1 = function (key) {
            var value = getValue(key);
            var dataPath = (_b = treeListPathGetter(value)) !== null && _b !== void 0 ? _b : [null];
            if (dataPath.length > 1) {
                this_1.groupsExist = true;
            }
            var available = availableKeys.has(key);
            var children = this_1.allDisplayedItemsTree;
            var item;
            var parentTreeKeys = [];
            dataPath.forEach(function (treeKey, depth) {
                if (!children) {
                    children = [];
                    item.children = children;
                }
                item = children.find(function (child) { var _a; return ((_a = child.treeKey) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === (treeKey === null || treeKey === void 0 ? void 0 : treeKey.toUpperCase()); });
                if (!item) {
                    item = { treeKey: treeKey, depth: depth, filterPasses: true, expanded: false, available: available, parentTreeKeys: parentTreeKeys };
                    if (depth === dataPath.length - 1) {
                        item.key = key;
                    }
                    children.push(item);
                }
                children = item.children;
                parentTreeKeys = __spread(parentTreeKeys, [treeKey]);
            });
        };
        var this_1 = this;
        try {
            for (var allKeys_1 = __values(allKeys), allKeys_1_1 = allKeys_1.next(); !allKeys_1_1.done; allKeys_1_1 = allKeys_1.next()) {
                var key = allKeys_1_1.value;
                _loop_1(key);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (allKeys_1_1 && !allKeys_1_1.done && (_a = allKeys_1.return)) _a.call(allKeys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // update the parent availability based on the children
        this.updateAvailable(availableKeys);
        this.selectAllItem.children = this.allDisplayedItemsTree;
        this.selectAllItem.expanded = false;
    };
    TreeSetDisplayValueModel.prototype.getTreeListPathGetter = function (getValue, availableKeys) {
        var e_2, _a;
        if (this.treeListPathGetter) {
            return this.treeListPathGetter;
        }
        if (this.treeDataOrGrouping) {
            return function (value) { return value; };
        }
        // infer from data
        var isDate = false;
        try {
            for (var availableKeys_1 = __values(availableKeys), availableKeys_1_1 = availableKeys_1.next(); !availableKeys_1_1.done; availableKeys_1_1 = availableKeys_1.next()) {
                var availableKey = availableKeys_1_1.value;
                // find the first non-null value
                var value = getValue(availableKey);
                if (value instanceof Date) {
                    isDate = true;
                    break;
                }
                else if (value != null) {
                    break;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (availableKeys_1_1 && !availableKeys_1_1.done && (_a = availableKeys_1.return)) _a.call(availableKeys_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (isDate) {
            return TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER;
        }
        _.doOnce(function () { return console.warn('AG Grid: property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date.'); }, 'getTreeListPathGetter');
        return function (value) { return [String(value)]; };
    };
    TreeSetDisplayValueModel.prototype.flattenItems = function () {
        var _this = this;
        this.activeDisplayedItemsFlat = [];
        var recursivelyFlattenDisplayedItems = function (items) {
            items.forEach(function (item) {
                if (!item.filterPasses || !item.available) {
                    return;
                }
                _this.activeDisplayedItemsFlat.push(item);
                if (item.children && item.expanded) {
                    recursivelyFlattenDisplayedItems(item.children);
                }
            });
        };
        recursivelyFlattenDisplayedItems(this.allDisplayedItemsTree);
    };
    TreeSetDisplayValueModel.prototype.resetFilter = function () {
        var recursiveFilterReset = function (item) {
            if (item.children) {
                item.children.forEach(function (child) {
                    recursiveFilterReset(child);
                });
            }
            item.filterPasses = true;
        };
        this.allDisplayedItemsTree.forEach(function (item) { return recursiveFilterReset(item); });
    };
    TreeSetDisplayValueModel.prototype.updateFilter = function (matchesFilter, nullMatchesFilter) {
        var _this = this;
        var passesFilter = function (item) {
            if (!item.available) {
                return false;
            }
            if (item.treeKey == null) {
                return nullMatchesFilter;
            }
            return matchesFilter(_this.formatter(_this.treeListFormatter ? _this.treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys) : item.treeKey));
        };
        this.allDisplayedItemsTree.forEach(function (item) { return _this.recursiveItemCheck(item, false, passesFilter, 'filterPasses'); });
    };
    TreeSetDisplayValueModel.prototype.getDisplayedValueCount = function () {
        return this.activeDisplayedItemsFlat.length;
    };
    TreeSetDisplayValueModel.prototype.getDisplayedItem = function (index) {
        return this.activeDisplayedItemsFlat[index];
    };
    TreeSetDisplayValueModel.prototype.getSelectAllItem = function () {
        return this.selectAllItem;
    };
    TreeSetDisplayValueModel.prototype.getDisplayedKeys = function () {
        var displayedKeys = [];
        this.forEachDisplayedKey(function (key) { return displayedKeys.push(key); });
        return displayedKeys;
    };
    TreeSetDisplayValueModel.prototype.forEachDisplayedKey = function (func) {
        var recursiveForEachItem = function (item, topParentExpanded) {
            if (item.children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    item.children.forEach(function (child) {
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
        this.activeDisplayedItemsFlat.forEach(function (item) { return recursiveForEachItem(item, true); });
    };
    TreeSetDisplayValueModel.prototype.someDisplayedKey = function (func) {
        var recursiveSomeItem = function (item, topParentExpanded) {
            if (item.children) {
                if (!item.expanded || !topParentExpanded) {
                    // if the parent is not expanded, we need to iterate the entire tree
                    return item.children.some(function (child) {
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
        return this.activeDisplayedItemsFlat.some(function (item) { return recursiveSomeItem(item, true); });
    };
    TreeSetDisplayValueModel.prototype.hasGroups = function () {
        return this.groupsExist;
    };
    TreeSetDisplayValueModel.prototype.refresh = function () {
        this.updateExpandAll();
        this.flattenItems();
    };
    TreeSetDisplayValueModel.prototype.updateExpandAll = function () {
        var recursiveExpansionCheck = function (items, someTrue, someFalse) {
            var e_3, _a;
            try {
                for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                    var item_1 = items_1_1.value;
                    if (!item_1.filterPasses || !item_1.available || !item_1.children) {
                        continue;
                    }
                    // indeterminate state only exists for expand all, so don't need to check for the current item
                    someTrue = someTrue || !!item_1.expanded;
                    someFalse = someFalse || !item_1.expanded;
                    if (someTrue && someFalse) {
                        // already indeterminate. No need to check the children
                        return undefined;
                    }
                    var childExpanded = recursiveExpansionCheck(item_1.children, someTrue, someFalse);
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
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return someTrue && someFalse ? undefined : someTrue;
        };
        var item = this.getSelectAllItem();
        item.expanded = recursiveExpansionCheck(item.children, false, false);
    };
    TreeSetDisplayValueModel.prototype.recursiveItemCheck = function (item, parentPasses, checkFunction, itemProp) {
        var _this = this;
        var atLeastOneChildPassed = false;
        if (item.children) {
            item.children.forEach(function (child) {
                var childPasses = _this.recursiveItemCheck(child, parentPasses || checkFunction(item), checkFunction, itemProp);
                atLeastOneChildPassed = atLeastOneChildPassed || childPasses;
            });
        }
        var itemPasses = parentPasses || atLeastOneChildPassed || checkFunction(item);
        item[itemProp] = itemPasses;
        return itemPasses;
    };
    TreeSetDisplayValueModel.prototype.updateAvailable = function (availableKeys) {
        var _this = this;
        var isAvailable = function (item) { return availableKeys.has(item.key); };
        this.allDisplayedItemsTree.forEach(function (item) { return _this.recursiveItemCheck(item, false, isAvailable, 'available'); });
    };
    TreeSetDisplayValueModel.DATE_TREE_LIST_PATH_GETTER = function (date) { return date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null; };
    return TreeSetDisplayValueModel;
}());
export { TreeSetDisplayValueModel };
