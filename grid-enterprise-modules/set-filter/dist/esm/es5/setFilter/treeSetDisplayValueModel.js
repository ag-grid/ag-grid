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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
                parentTreeKeys = __spreadArray(__spreadArray([], __read(parentTreeKeys)), [treeKey]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVNldERpc3BsYXlWYWx1ZU1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci90cmVlU2V0RGlzcGxheVZhbHVlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFpQixNQUFNLHlCQUF5QixDQUFDO0FBQzNELE9BQU8sRUFBeUIscUJBQXFCLEVBQTBCLE1BQU0seUJBQXlCLENBQUM7QUFFL0c7SUFxQkksa0NBQ3FCLFNBQXdCLEVBQ3hCLGtCQUF5RCxFQUN6RCxpQkFBd0csRUFDeEcsa0JBQTRCO1FBSDVCLGNBQVMsR0FBVCxTQUFTLENBQWU7UUFDeEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUF1QztRQUN6RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQXVGO1FBQ3hHLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBVTtRQXRCakQsOENBQThDO1FBQ3RDLDBCQUFxQixHQUE2QixFQUFFLENBQUM7UUFDN0QsaURBQWlEO1FBQ3pDLDZCQUF3QixHQUE2QixFQUFFLENBQUM7UUFJL0Msa0JBQWEsR0FBMkI7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFDUixZQUFZLEVBQUUsSUFBSTtZQUNsQixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxVQUFVO1lBQ3pDLFFBQVEsRUFBRSxJQUFJLENBQUMscUJBQXFCO1lBQ3BDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsR0FBRyxFQUFFLHFCQUFxQixDQUFDLFVBQVU7WUFDckMsY0FBYyxFQUFFLEVBQUU7U0FDckIsQ0FBQztJQU9DLENBQUM7SUFBQSxDQUFDO0lBRUUsc0VBQW1DLEdBQTFDLFVBQ0ksUUFBMEMsRUFDMUMsT0FBNEMsRUFDNUMsYUFBaUMsRUFDakMsTUFBK0M7UUFFL0MsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsT0FBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzVEO2FBQU0sSUFBSSxNQUFNLEtBQUssYUFBYSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQzFCO2FBQU0sSUFBSSxNQUFNLEtBQUssWUFBWSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVNLHlFQUFzQyxHQUE3QyxVQUNJLFFBQTBDLEVBQzFDLE9BQTRDLEVBQzVDLGFBQWlDLEVBQ2pDLGFBQXVELEVBQ3ZELGlCQUEwQixFQUMxQixNQUErQztRQUUvQyxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDckIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDNUQ7YUFBTSxJQUFJLE1BQU0sS0FBSyxhQUFhLEVBQUU7WUFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUN2QztRQUVELElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU8sbURBQWdCLEdBQXhCLFVBQXlCLFFBQTBDLEVBQUUsT0FBZ0MsRUFBRSxhQUFpQzs7O1FBQ3BJLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFFekIsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dDQUN0RSxHQUFHO1lBQ1IsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBRSxDQUFDO1lBQzdCLElBQU0sUUFBUSxHQUFHLE1BQUEsa0JBQWtCLENBQUMsS0FBSyxDQUFDLG1DQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsT0FBSyxXQUFXLEdBQUcsSUFBSSxDQUFDO2FBQzNCO1lBQ0QsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLFFBQVEsR0FBeUMsT0FBSyxxQkFBcUIsQ0FBQztZQUNoRixJQUFJLElBQXdDLENBQUM7WUFDN0MsSUFBSSxjQUFjLEdBQXNCLEVBQUUsQ0FBQztZQUMzQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBc0IsRUFBRSxLQUFhO2dCQUNuRCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNYLFFBQVEsR0FBRyxFQUFFLENBQUM7b0JBQ2QsSUFBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7aUJBQzdCO2dCQUNELElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSyxZQUFJLE9BQUEsQ0FBQSxNQUFBLEtBQUssQ0FBQyxPQUFPLDBDQUFFLFdBQVcsRUFBRSxPQUFLLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxXQUFXLEVBQUUsQ0FBQSxDQUFBLEVBQUEsQ0FBQyxDQUFDO2dCQUN2RixJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNQLElBQUksR0FBRyxFQUFFLE9BQU8sU0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLFdBQUEsRUFBRSxjQUFjLGdCQUFBLEVBQUUsQ0FBQztvQkFDMUYsSUFBSSxLQUFLLEtBQUssUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO3FCQUNsQjtvQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN2QjtnQkFDRCxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDekIsY0FBYywwQ0FBTyxjQUFjLEtBQUUsT0FBTyxFQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7Ozs7WUF6QlAsS0FBZ0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBO2dCQUFsQixJQUFJLEdBQUcsb0JBQUE7d0JBQUgsR0FBRzthQTBCWDs7Ozs7Ozs7O1FBQ0QsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN4QyxDQUFDO0lBRU8sd0RBQXFCLEdBQTdCLFVBQThCLFFBQTBDLEVBQUUsYUFBaUM7O1FBQ3ZHLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekIsT0FBTyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQVksRUFBWixDQUFZLENBQUM7U0FDaEM7UUFDRCxrQkFBa0I7UUFDbEIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDOztZQUNuQixLQUEyQixJQUFBLGtCQUFBLFNBQUEsYUFBYSxDQUFBLDRDQUFBLHVFQUFFO2dCQUFyQyxJQUFNLFlBQVksMEJBQUE7Z0JBQ25CLGdDQUFnQztnQkFDaEMsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLEtBQUssWUFBWSxJQUFJLEVBQUU7b0JBQ3ZCLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBQ2QsTUFBTTtpQkFDVDtxQkFBTSxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7b0JBQ3RCLE1BQU07aUJBQ1Q7YUFDSjs7Ozs7Ozs7O1FBQ0QsSUFBSSxNQUFNLEVBQUU7WUFDUixPQUFPLHdCQUF3QixDQUFDLDBCQUFpQyxDQUFDO1NBQ3JFO1FBQ0QsQ0FBQyxDQUFDLE1BQU0sQ0FDSixjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyw2SEFBNkgsQ0FBQyxFQUEzSSxDQUEySSxFQUNqSix1QkFBdUIsQ0FDMUIsQ0FBQztRQUNGLE9BQU8sVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFmLENBQWUsQ0FBQztJQUNwQyxDQUFDO0lBRU8sK0NBQVksR0FBcEI7UUFBQSxpQkFZQztRQVhHLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUM7UUFDbkMsSUFBTSxnQ0FBZ0MsR0FBRyxVQUFDLEtBQStCO1lBQ3JFLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2dCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFBRSxPQUFPO2lCQUFFO2dCQUN0RCxLQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDaEMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2lCQUNsRDtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBQ0YsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVPLDhDQUFXLEdBQW5CO1FBQ0ksSUFBTSxvQkFBb0IsR0FBRyxVQUFDLElBQTRCO1lBQ3RELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7b0JBQ3ZCLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDN0IsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLG9CQUFvQixDQUFDLElBQUksQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVPLCtDQUFZLEdBQXBCLFVBQXFCLGFBQXVELEVBQUUsaUJBQTBCO1FBQXhHLGlCQWVDO1FBZEcsSUFBTSxZQUFZLEdBQUcsVUFBQyxJQUE0QjtZQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDakIsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO2dCQUN0QixPQUFPLGlCQUFpQixDQUFDO2FBQzVCO1lBRUQsT0FBTyxhQUFhLENBQ2hCLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUNoSSxDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsRUFBbEUsQ0FBa0UsQ0FBQyxDQUFDO0lBQ25ILENBQUM7SUFFTSx5REFBc0IsR0FBN0I7UUFDSSxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7SUFDaEQsQ0FBQztJQUVNLG1EQUFnQixHQUF2QixVQUF3QixLQUFhO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSxtREFBZ0IsR0FBdkI7UUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDOUIsQ0FBQztJQUVNLG1EQUFnQixHQUF2QjtRQUNJLElBQU0sYUFBYSxHQUFzQixFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQUMsR0FBRyxJQUFLLE9BQUEsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1FBQzNELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxzREFBbUIsR0FBMUIsVUFBMkIsSUFBa0M7UUFDekQsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLElBQTRCLEVBQUUsaUJBQTBCO1lBQ2xGLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUN0QyxvRUFBb0U7b0JBQ3BFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSzt3QkFDdkIsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFOzRCQUNwQixvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQ3RDO29CQUNMLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFJLENBQUMsQ0FBQzthQUNuQjtRQUNMLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQWhDLENBQWdDLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRU0sbURBQWdCLEdBQXZCLFVBQXdCLElBQXFDO1FBQ3pELElBQU0saUJBQWlCLEdBQUcsVUFBQyxJQUE0QixFQUFFLGlCQUEwQjtZQUMvRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDdEMsb0VBQW9FO29CQUNwRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSzt3QkFDM0IsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFOzRCQUNwQixPQUFPLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzt5QkFDMUM7d0JBQ0QsT0FBTyxLQUFLLENBQUM7b0JBQ2pCLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVNLDRDQUFTLEdBQWhCO1FBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFFTSwwQ0FBTyxHQUFkO1FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU8sa0RBQWUsR0FBdkI7UUFDSSxJQUFNLHVCQUF1QixHQUFHLFVBQUMsS0FBK0IsRUFBRSxRQUFpQixFQUFFLFNBQWtCOzs7Z0JBQ25HLEtBQW1CLElBQUEsVUFBQSxTQUFBLEtBQUssQ0FBQSw0QkFBQSwrQ0FBRTtvQkFBckIsSUFBTSxNQUFJLGtCQUFBO29CQUNYLElBQUksQ0FBQyxNQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsTUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE1BQUksQ0FBQyxRQUFRLEVBQUU7d0JBQ3pELFNBQVM7cUJBQ1o7b0JBQ0QsOEZBQThGO29CQUM5RixRQUFRLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxNQUFJLENBQUMsUUFBUSxDQUFDO29CQUN2QyxTQUFTLEdBQUcsU0FBUyxJQUFJLENBQUMsTUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDeEMsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUN2Qix1REFBdUQ7d0JBQ3ZELE9BQU8sU0FBUyxDQUFDO3FCQUNwQjtvQkFDRCxJQUFNLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQyxNQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDbEYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO3dCQUM3QixPQUFPLFNBQVMsQ0FBQztxQkFDcEI7eUJBQU0sSUFBSSxhQUFhLEVBQUU7d0JBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUM7cUJBQ25CO3lCQUFNO3dCQUNILFNBQVMsR0FBRyxJQUFJLENBQUM7cUJBQ3BCO2lCQUNKOzs7Ozs7Ozs7WUFDRCxPQUFPLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3hELENBQUMsQ0FBQztRQUVGLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFFBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLHFEQUFrQixHQUExQixVQUNJLElBQTRCLEVBQzVCLFlBQXFCLEVBQ3JCLGFBQXdELEVBQ3hELFFBQXNDO1FBSjFDLGlCQWlCQztRQVhHLElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztnQkFDdkIsSUFBTSxXQUFXLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxZQUFZLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakgscUJBQXFCLEdBQUcscUJBQXFCLElBQUksV0FBVyxDQUFDO1lBQ2pFLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFNLFVBQVUsR0FBRyxZQUFZLElBQUkscUJBQXFCLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUM7UUFDNUIsT0FBTyxVQUFVLENBQUM7SUFDMUIsQ0FBQztJQUVPLGtEQUFlLEdBQXZCLFVBQXdCLGFBQWlDO1FBQXpELGlCQUlDO1FBSEcsSUFBTSxXQUFXLEdBQUcsVUFBQyxJQUE0QixJQUFLLE9BQUEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLEVBQTVCLENBQTRCLENBQUM7UUFFbkYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBOUQsQ0FBOEQsQ0FBQyxDQUFDO0lBQy9HLENBQUM7SUExU3VCLG1EQUEwQixHQUFHLFVBQUMsSUFBaUIsSUFBSyxPQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUEvRixDQUErRixDQUFDO0lBMlNoTCwrQkFBQztDQUFBLEFBNVNELElBNFNDO1NBNVNZLHdCQUF3QiJ9