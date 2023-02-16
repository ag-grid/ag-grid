/**
          * @ag-grid-enterprise/set-filter - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.1.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

/** @param V type of value in the Set Filter */
var ClientSideValuesExtractor = /** @class */ (function () {
    function ClientSideValuesExtractor(rowModel, filterParams, createKey, caseFormat, columnModel, valueService, treeDataOrGrouping, treeData, getDataPath) {
        this.rowModel = rowModel;
        this.filterParams = filterParams;
        this.createKey = createKey;
        this.caseFormat = caseFormat;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.treeDataOrGrouping = treeDataOrGrouping;
        this.treeData = treeData;
        this.getDataPath = getDataPath;
    }
    ClientSideValuesExtractor.prototype.extractUniqueValues = function (predicate, existingValues) {
        var _this = this;
        var values = new Map();
        var existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
        var formattedKeys = new Set();
        var treeData = this.treeData && !!this.getDataPath;
        var groupedCols = this.columnModel.getRowGroupColumns();
        var addValue = function (unformattedKey, value) {
            var formattedKey = _this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                var keyToAdd = unformattedKey;
                var valueToAdd = core._.makeNull(value);
                // when case insensitive, we pick the first value to use. if this is later filtered out,
                // we still want to use the original value and not one with a different case
                var existingUnformattedKey = existingFormattedKeys === null || existingFormattedKeys === void 0 ? void 0 : existingFormattedKeys.get(formattedKey);
                if (existingUnformattedKey != null) {
                    keyToAdd = existingUnformattedKey;
                    valueToAdd = existingValues.get(existingUnformattedKey);
                }
                values.set(keyToAdd, valueToAdd);
            }
        };
        this.rowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            if (_this.treeDataOrGrouping) {
                _this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue);
                return;
            }
            var value = _this.getValue(node);
            if (_this.filterParams.convertValuesToStrings) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                _this.addValueForConvertValuesToString(node, value, addValue);
                return;
            }
            if (value != null && Array.isArray(value)) {
                value.forEach(function (x) {
                    addValue(_this.createKey(x, node), x);
                });
                if (value.length === 0) {
                    addValue(null, null);
                }
            }
            else {
                addValue(_this.createKey(value, node), value);
            }
        });
        return values;
    };
    ClientSideValuesExtractor.prototype.addValueForConvertValuesToString = function (node, value, addValue) {
        var key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            key.forEach(function (part) {
                var processedPart = core._.toStringOrNull(core._.makeNull(part));
                addValue(processedPart, processedPart);
            });
            if (key.length === 0) {
                addValue(null, null);
            }
        }
        else {
            addValue(key, key);
        }
    };
    ClientSideValuesExtractor.prototype.addValueForTreeDataOrGrouping = function (node, treeData, groupedCols, addValue) {
        var _this = this;
        var _a;
        var dataPath;
        if (treeData) {
            if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
                return;
            }
            dataPath = this.getDataPath(node.data);
        }
        else {
            dataPath = groupedCols.map(function (groupCol) { return _this.valueService.getKeyForNode(groupCol, node); });
            dataPath.push(this.getValue(node));
        }
        if (dataPath) {
            dataPath = dataPath.map(function (treeKey) { return core._.toStringOrNull(core._.makeNull(treeKey)); });
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(function (treeKey) { return treeKey == null; })) {
            dataPath = null;
        }
        addValue(this.createKey(dataPath), dataPath);
    };
    ClientSideValuesExtractor.prototype.getValue = function (node) {
        var _a = this.filterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        return this.filterParams.valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: node.data,
            getValue: function (field) { return node.data[field]; },
            node: node,
        });
    };
    ClientSideValuesExtractor.prototype.extractExistingFormattedKeys = function (existingValues) {
        var _this = this;
        if (!existingValues) {
            return null;
        }
        var existingFormattedKeys = new Map();
        existingValues.forEach(function (_value, key) {
            existingFormattedKeys.set(_this.caseFormat(key), key);
        });
        return existingFormattedKeys;
    };
    return ClientSideValuesExtractor;
}());

var SetFilterDisplayValue = /** @class */ (function () {
    function SetFilterDisplayValue() {
    }
    SetFilterDisplayValue.SELECT_ALL = '__AG_SELECT_ALL__';
    return SetFilterDisplayValue;
}());

var __values$1 = (undefined && undefined.__values) || function(o) {
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
var FlatSetDisplayValueModel = /** @class */ (function () {
    function FlatSetDisplayValueModel(valueFormatterService, valueFormatter, formatter, column) {
        this.valueFormatterService = valueFormatterService;
        this.valueFormatter = valueFormatter;
        this.formatter = formatter;
        this.column = column;
        /** All keys that are currently displayed, after the mini-filter has been applied. */
        this.displayedKeys = [];
    }
    FlatSetDisplayValueModel.prototype.updateDisplayedValuesToAllAvailable = function (_getValue, _allKeys, availableKeys) {
        this.displayedKeys = Array.from(availableKeys);
    };
    FlatSetDisplayValueModel.prototype.updateDisplayedValuesToMatchMiniFilter = function (getValue, _allKeys, availableKeys, matchesFilter, nullMatchesFilter) {
        var e_1, _a;
        this.displayedKeys = [];
        try {
            for (var availableKeys_1 = __values$1(availableKeys), availableKeys_1_1 = availableKeys_1.next(); !availableKeys_1_1.done; availableKeys_1_1 = availableKeys_1.next()) {
                var key = availableKeys_1_1.value;
                if (key == null) {
                    if (nullMatchesFilter) {
                        this.displayedKeys.push(key);
                    }
                }
                else {
                    var value = getValue(key);
                    var valueFormatterValue = this.valueFormatterService.formatValue(this.column, null, value, this.valueFormatter, false);
                    var textFormatterValue = this.formatter(valueFormatterValue);
                    if (matchesFilter(textFormatterValue)) {
                        this.displayedKeys.push(key);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (availableKeys_1_1 && !availableKeys_1_1.done && (_a = availableKeys_1.return)) _a.call(availableKeys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FlatSetDisplayValueModel.prototype.getDisplayedValueCount = function () {
        return this.displayedKeys.length;
    };
    FlatSetDisplayValueModel.prototype.getDisplayedItem = function (index) {
        return this.displayedKeys[index];
    };
    FlatSetDisplayValueModel.prototype.getSelectAllItem = function () {
        return SetFilterDisplayValue.SELECT_ALL;
    };
    FlatSetDisplayValueModel.prototype.getDisplayedKeys = function () {
        return this.displayedKeys;
    };
    FlatSetDisplayValueModel.prototype.forEachDisplayedKey = function (func) {
        this.displayedKeys.forEach(func);
    };
    FlatSetDisplayValueModel.prototype.someDisplayedKey = function (func) {
        return this.displayedKeys.some(func);
    };
    FlatSetDisplayValueModel.prototype.hasGroups = function () {
        return false;
    };
    FlatSetDisplayValueModel.prototype.refresh = function () {
        // not used
    };
    return FlatSetDisplayValueModel;
}());

var __read$1 = (undefined && undefined.__read) || function (o, n) {
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
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
var __values = (undefined && undefined.__values) || function(o) {
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
        core._.doOnce(function () { return console.warn('AG Grid: property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date.'); }, 'getTreeListPathGetter');
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
        return this.activeDisplayedItemsFlat.map(function (_a) {
            var treeKey = _a.treeKey;
            return treeKey;
        });
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

var __read = (undefined && undefined.__read) || function (o, n) {
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
var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType || (SetFilterModelValuesType = {}));
/** @param V type of value in the Set Filter */
var SetValueModel = /** @class */ (function () {
    function SetValueModel(params) {
        var _this = this;
        var _a;
        this.localEventService = new core.EventService();
        this.miniFilterText = null;
        /** Values provided to the filter for use. */
        this.providedValues = null;
        /** All possible values for the filter, sorted if required. */
        this.allValues = new Map();
        /** Remaining keys when filters from other columns have been applied. */
        this.availableKeys = new Set();
        /** Keys that have been selected for this filter. */
        this.selectedKeys = new Set();
        this.initialised = false;
        var usingComplexObjects = params.usingComplexObjects, columnModel = params.columnModel, valueService = params.valueService, treeDataTreeList = params.treeDataTreeList, groupingTreeList = params.groupingTreeList, filterParams = params.filterParams, gridOptionsService = params.gridOptionsService, valueFormatterService = params.valueFormatterService, valueFormatter = params.valueFormatter;
        var column = filterParams.column, colDef = filterParams.colDef, textFormatter = filterParams.textFormatter, doesRowPassOtherFilter = filterParams.doesRowPassOtherFilter, suppressSorting = filterParams.suppressSorting, comparator = filterParams.comparator, rowModel = filterParams.rowModel, values = filterParams.values, caseSensitive = filterParams.caseSensitive, convertValuesToStrings = filterParams.convertValuesToStrings, treeList = filterParams.treeList, treeListPathGetter = filterParams.treeListPathGetter, treeListFormatter = filterParams.treeListFormatter;
        this.filterParams = filterParams;
        this.setIsLoading = params.setIsLoading;
        this.translate = params.translate;
        this.caseFormat = params.caseFormat;
        this.createKey = params.createKey;
        this.usingComplexObjects = !!params.usingComplexObjects;
        this.formatter = textFormatter || core.TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.convertValuesToStrings = !!convertValuesToStrings;
        var keyComparator = comparator !== null && comparator !== void 0 ? comparator : colDef.comparator;
        var treeDataOrGrouping = !!treeDataTreeList || !!groupingTreeList;
        // If using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys.
        // Also if tree data, grouping, or date with tree list, then need to do value sort
        this.compareByValue = !!((usingComplexObjects && keyComparator) || treeDataOrGrouping || (treeList && !treeListPathGetter));
        if (treeDataOrGrouping && !keyComparator) {
            this.entryComparator = this.createTreeDataOrGroupingComparator();
        }
        else if (treeList && !treeListPathGetter && !keyComparator) {
            this.entryComparator = function (_a, _b) {
                var _c = __read(_a, 2); _c[0]; var aValue = _c[1];
                var _d = __read(_b, 2); _d[0]; var bValue = _d[1];
                return core._.defaultComparator(aValue, bValue);
            };
        }
        else {
            this.entryComparator = function (_a, _b) {
                var _c = __read(_a, 2); _c[0]; var aValue = _c[1];
                var _d = __read(_b, 2); _d[0]; var bValue = _d[1];
                return keyComparator(aValue, bValue);
            };
        }
        this.keyComparator = (_a = keyComparator) !== null && _a !== void 0 ? _a : core._.defaultComparator;
        this.caseSensitive = !!caseSensitive;
        var getDataPath = gridOptionsService.get('getDataPath');
        if (rowModel.getType() === 'clientSide') {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(rowModel, this.filterParams, this.createKey, this.caseFormat, columnModel, valueService, treeDataOrGrouping, !!treeDataTreeList, getDataPath);
        }
        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        }
        else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;
            this.providedValues = values;
        }
        this.displayValueModel = treeList ? new TreeSetDisplayValueModel(this.formatter, treeListPathGetter, treeListFormatter, treeDataTreeList || groupingTreeList) : new FlatSetDisplayValueModel(valueFormatterService, valueFormatter, this.formatter, column);
        this.updateAllValues().then(function (updatedKeys) { return _this.resetSelectionState(updatedKeys || []); });
    }
    SetValueModel.prototype.addEventListener = function (eventType, listener, async) {
        this.localEventService.addEventListener(eventType, listener, async);
    };
    SetValueModel.prototype.removeEventListener = function (eventType, listener, async) {
        this.localEventService.removeEventListener(eventType, listener, async);
    };
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    SetValueModel.prototype.refreshValues = function () {
        var currentModel = this.getModel();
        this.updateAllValues();
        // ensure model is updated for new values
        return this.setModel(currentModel);
    };
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    SetValueModel.prototype.overrideValues = function (valuesToUse) {
        var _this = this;
        return new core.AgPromise(function (resolve) {
            // wait for any existing values to be populated before overriding
            _this.allValuesPromise.then(function () {
                _this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                _this.providedValues = valuesToUse;
                _this.refreshValues().then(function () { return resolve(); });
            });
        });
    };
    /** @return has anything been updated */
    SetValueModel.prototype.refreshAfterAnyFilterChanged = function () {
        var _this = this;
        if (this.showAvailableOnly()) {
            return this.allValuesPromise.then(function (keys) {
                _this.updateAvailableKeys(keys !== null && keys !== void 0 ? keys : [], 'otherFilter');
                return true;
            });
        }
        return core.AgPromise.resolve(false);
    };
    SetValueModel.prototype.isInitialised = function () {
        return this.initialised;
    };
    SetValueModel.prototype.updateAllValues = function () {
        var _this = this;
        this.allValuesPromise = new core.AgPromise(function (resolve) {
            switch (_this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(_this.processAllKeys(_this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, _this.providedValues));
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    _this.setIsLoading(true);
                    var callback_1 = _this.providedValues;
                    var _a = _this.filterParams, columnApi = _a.columnApi, api = _a.api, context = _a.context, column = _a.column, colDef = _a.colDef;
                    var params_1 = {
                        success: function (values) {
                            _this.setIsLoading(false);
                            resolve(_this.processAllKeys(false, values));
                        },
                        colDef: colDef,
                        column: column,
                        columnApi: columnApi,
                        api: api,
                        context: context,
                    };
                    window.setTimeout(function () { return callback_1(params_1); }, 0);
                    break;
                }
                default:
                    throw new Error('Unrecognised valuesType');
            }
        });
        this.allValuesPromise.then(function (values) { return _this.updateAvailableKeys(values || [], 'reload'); }).then(function () { return _this.initialised = true; });
        return this.allValuesPromise;
    };
    SetValueModel.prototype.processAllKeys = function (getFromRows, providedValues) {
        var values = getFromRows ? this.getValuesFromRows(false) : this.uniqueValues(this.validateProvidedValues(providedValues));
        var sortedKeys = this.sortKeys(values);
        this.allValues = values !== null && values !== void 0 ? values : new Map();
        return sortedKeys;
    };
    SetValueModel.prototype.validateProvidedValues = function (values) {
        if (this.usingComplexObjects && (values === null || values === void 0 ? void 0 : values.length)) {
            var firstValue = values[0];
            if (firstValue && typeof firstValue !== 'object' && typeof firstValue !== 'function') {
                var firstKey = this.createKey(firstValue);
                if (firstKey == null) {
                    core._.doOnce(function () { return console.warn('Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'); }, 'setFilterComplexObjectsProvidedNull');
                }
                else {
                    core._.doOnce(function () { return console.warn('AG Grid: Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects or enable convertValuesToStrings?'); }, 'setFilterComplexObjectsProvidedPrimitive');
                }
            }
        }
        return values;
    };
    SetValueModel.prototype.setValuesType = function (value) {
        this.valuesType = value;
    };
    SetValueModel.prototype.getValuesType = function () {
        return this.valuesType;
    };
    SetValueModel.prototype.isKeyAvailable = function (key) {
        return this.availableKeys.has(key);
    };
    SetValueModel.prototype.showAvailableOnly = function () {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    };
    SetValueModel.prototype.updateAvailableKeys = function (allKeys, source) {
        var availableKeys = this.showAvailableOnly() ? this.sortKeys(this.getValuesFromRows(true)) : allKeys;
        this.availableKeys = new Set(availableKeys);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
        this.updateDisplayedValues(source, allKeys);
    };
    SetValueModel.prototype.sortKeys = function (nullableValues) {
        var values = nullableValues !== null && nullableValues !== void 0 ? nullableValues : new Map();
        if (this.suppressSorting) {
            return Array.from(values.keys());
        }
        var sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries()).sort(this.entryComparator).map(function (_a) {
                var _b = __read(_a, 1), key = _b[0];
                return key;
            });
        }
        else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }
        if (this.filterParams.excelMode && values.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter(function (v) { return v != null; });
            sortedKeys.push(null);
        }
        return sortedKeys;
    };
    SetValueModel.prototype.getValuesFromRows = function (removeUnavailableValues) {
        var _this = this;
        if (removeUnavailableValues === void 0) { removeUnavailableValues = false; }
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return null;
        }
        var predicate = function (node) { return (!removeUnavailableValues || _this.doesRowPassOtherFilters(node)); };
        return this.clientSideValuesExtractor.extractUniqueValues(predicate, removeUnavailableValues && !this.caseSensitive ? this.allValues : undefined);
    };
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    SetValueModel.prototype.setMiniFilter = function (value) {
        value = core._.makeNull(value);
        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilterText = value;
        this.updateDisplayedValues('miniFilter');
        return true;
    };
    SetValueModel.prototype.getMiniFilter = function () {
        return this.miniFilterText;
    };
    SetValueModel.prototype.updateDisplayedValues = function (source, allKeys) {
        var _this = this;
        if (source === 'expansion') {
            this.displayValueModel.refresh();
            return;
        }
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayValueModel.updateDisplayedValuesToAllAvailable(function (key) { return _this.getValue(key); }, allKeys, this.availableKeys, source);
            return;
        }
        // if filter present, we filter down the list
        // to allow for case insensitive searches, upper-case both filter text and value
        var formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');
        var matchesFilter = function (valueToCheck) {
            return valueToCheck != null && _this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;
        };
        var nullMatchesFilter = !!this.filterParams.excelMode && matchesFilter(this.translate('blanks'));
        this.displayValueModel.updateDisplayedValuesToMatchMiniFilter(function (key) { return _this.getValue(key); }, allKeys, this.availableKeys, matchesFilter, nullMatchesFilter, source);
    };
    SetValueModel.prototype.getDisplayedValueCount = function () {
        return this.displayValueModel.getDisplayedValueCount();
    };
    SetValueModel.prototype.getDisplayedItem = function (index) {
        return this.displayValueModel.getDisplayedItem(index);
    };
    SetValueModel.prototype.getSelectAllItem = function () {
        return this.displayValueModel.getSelectAllItem();
    };
    SetValueModel.prototype.hasSelections = function () {
        return this.filterParams.defaultToNothingSelected ?
            this.selectedKeys.size > 0 :
            this.allValues.size !== this.selectedKeys.size;
    };
    SetValueModel.prototype.getKeys = function () {
        return Array.from(this.allValues.keys());
    };
    SetValueModel.prototype.getValues = function () {
        return Array.from(this.allValues.values());
    };
    SetValueModel.prototype.getValue = function (key) {
        return this.allValues.get(key);
    };
    SetValueModel.prototype.selectAllMatchingMiniFilter = function (clearExistingSelection) {
        var _this = this;
        if (clearExistingSelection === void 0) { clearExistingSelection = false; }
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedKeys = new Set(this.allValues.keys());
        }
        else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedKeys.clear();
            }
            this.displayValueModel.forEachDisplayedKey(function (key) { return _this.selectedKeys.add(key); });
        }
    };
    SetValueModel.prototype.deselectAllMatchingMiniFilter = function () {
        var _this = this;
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedKeys.clear();
        }
        else {
            // ensure everything that matches the mini filter is deselected
            this.displayValueModel.forEachDisplayedKey(function (key) { return _this.selectedKeys.delete(key); });
        }
    };
    SetValueModel.prototype.selectKey = function (key) {
        this.selectedKeys.add(key);
    };
    SetValueModel.prototype.deselectKey = function (key) {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
        }
        this.selectedKeys.delete(key);
    };
    SetValueModel.prototype.isKeySelected = function (key) {
        return this.selectedKeys.has(key);
    };
    SetValueModel.prototype.isEverythingVisibleSelected = function () {
        var _this = this;
        return !this.displayValueModel.someDisplayedKey(function (it) { return !_this.isKeySelected(it); });
    };
    SetValueModel.prototype.isNothingVisibleSelected = function () {
        var _this = this;
        return !this.displayValueModel.someDisplayedKey(function (it) { return _this.isKeySelected(it); });
    };
    SetValueModel.prototype.getModel = function () {
        return this.hasSelections() ? Array.from(this.selectedKeys) : null;
    };
    SetValueModel.prototype.setModel = function (model) {
        var _this = this;
        return this.allValuesPromise.then(function (keys) {
            if (model == null) {
                _this.resetSelectionState(keys !== null && keys !== void 0 ? keys : []);
            }
            else {
                // select all values from the model that exist in the filter
                _this.selectedKeys.clear();
                var existingFormattedKeys_1 = new Map();
                _this.allValues.forEach(function (_value, key) {
                    existingFormattedKeys_1.set(_this.caseFormat(key), key);
                });
                model.forEach(function (unformattedKey) {
                    var formattedKey = _this.caseFormat(unformattedKey);
                    var existingUnformattedKey = existingFormattedKeys_1.get(formattedKey);
                    if (existingUnformattedKey !== undefined) {
                        _this.selectKey(existingUnformattedKey);
                    }
                });
            }
        });
    };
    SetValueModel.prototype.uniqueValues = function (values) {
        var _this = this;
        var uniqueValues = new Map();
        var formattedKeys = new Set();
        (values !== null && values !== void 0 ? values : []).forEach(function (value) {
            var valueToUse = core._.makeNull(value);
            var unformattedKey = _this.convertAndGetKey(valueToUse);
            var formattedKey = _this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        });
        return uniqueValues;
    };
    SetValueModel.prototype.convertAndGetKey = function (value) {
        return this.convertValuesToStrings ? value : this.createKey(value);
    };
    SetValueModel.prototype.resetSelectionState = function (keys) {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedKeys.clear();
        }
        else {
            this.selectedKeys = new Set(keys);
        }
    };
    SetValueModel.prototype.hasGroups = function () {
        return this.displayValueModel.hasGroups();
    };
    SetValueModel.prototype.createTreeDataOrGroupingComparator = function () {
        return function (_a, _b) {
            var _c = __read(_a, 2); _c[0]; var aValue = _c[1];
            var _d = __read(_b, 2); _d[0]; var bValue = _d[1];
            if (aValue == null) {
                return bValue == null ? 0 : -1;
            }
            else if (bValue == null) {
                return 1;
            }
            for (var i = 0; i < aValue.length; i++) {
                if (i >= bValue.length) {
                    return 1;
                }
                var diff = core._.defaultComparator(aValue[i], bValue[i]);
                if (diff !== 0) {
                    return diff;
                }
            }
            return 0;
        };
    };
    SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';
    return SetValueModel;
}());

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** @param V type of value in the Set Filter */
var SetFilterListItem = /** @class */ (function (_super) {
    __extends$2(SetFilterListItem, _super);
    function SetFilterListItem(params) {
        var _a;
        var _this = _super.call(this, params.isGroup ? SetFilterListItem.GROUP_TEMPLATE : SetFilterListItem.TEMPLATE) || this;
        _this.focusWrapper = params.focusWrapper;
        _this.value = params.value;
        _this.params = params.params;
        _this.translate = params.translate;
        _this.valueFormatter = params.valueFormatter;
        _this.item = params.item;
        _this.isSelected = params.isSelected;
        _this.isTree = params.isTree;
        _this.depth = (_a = params.depth) !== null && _a !== void 0 ? _a : 0;
        _this.isGroup = params.isGroup;
        _this.groupsExist = params.groupsExist;
        _this.isExpanded = params.isExpanded;
        _this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
        return _this;
    }
    SetFilterListItem.prototype.init = function () {
        var _this = this;
        this.render();
        this.eCheckbox.setLabelEllipsis(true);
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
        this.refreshVariableAriaLabels();
        if (this.isTree) {
            if (this.depth > 0) {
                this.addCssClass('ag-set-filter-indent-' + this.depth);
            }
            if (this.isGroup) {
                this.setupExpansion();
            }
            else {
                if (this.groupsExist) {
                    this.addCssClass('ag-set-filter-add-group-indent');
                }
            }
            core._.setAriaLevel(this.focusWrapper, this.depth + 1);
        }
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange(function (value) { return _this.onCheckboxChanged(!!value); });
    };
    SetFilterListItem.prototype.setupExpansion = function () {
        this.eGroupClosedIcon.appendChild(core._.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(core._.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(core._.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
            this.addManagedListener(this.eGroupIndeterminateIcon, 'click', this.onExpandOrContractClicked.bind(this));
        }
        this.setExpandedIcons();
        this.refreshAriaExpanded();
    };
    SetFilterListItem.prototype.onExpandOrContractClicked = function () {
        this.setExpanded(!this.isExpanded);
    };
    SetFilterListItem.prototype.setExpanded = function (isExpanded, silent) {
        if (this.isGroup && isExpanded !== this.isExpanded) {
            this.isExpanded = isExpanded;
            var event_1 = {
                type: SetFilterListItem.EVENT_EXPANDED_CHANGED,
                isExpanded: !!isExpanded,
                item: this.item
            };
            if (!silent) {
                this.dispatchEvent(event_1);
            }
            this.setExpandedIcons();
            this.refreshAriaExpanded();
        }
    };
    SetFilterListItem.prototype.refreshAriaExpanded = function () {
        core._.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    };
    SetFilterListItem.prototype.setExpandedIcons = function () {
        core._.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        core._.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            core._.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
        }
    };
    SetFilterListItem.prototype.onCheckboxChanged = function (isSelected) {
        this.isSelected = isSelected;
        var event = {
            type: SetFilterListItem.EVENT_SELECTION_CHANGED,
            isSelected: isSelected,
            item: this.item
        };
        this.dispatchEvent(event);
        this.refreshVariableAriaLabels();
    };
    SetFilterListItem.prototype.toggleSelected = function () {
        if (!!this.params.readOnly) {
            return;
        }
        this.setSelected(!this.isSelected);
    };
    SetFilterListItem.prototype.setSelected = function (isSelected, silent) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(this.isSelected, silent);
    };
    SetFilterListItem.prototype.refreshVariableAriaLabels = function () {
        if (!this.isTree) {
            return;
        }
        var translate = this.localeService.getLocaleTextFunc();
        var checkboxValue = this.eCheckbox.getValue();
        var state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        core._.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined);
        this.eCheckbox.setInputAriaLabel(visibilityLabel + " (" + state + ")");
    };
    SetFilterListItem.prototype.setupFixedAriaLabels = function (value) {
        if (!this.isTree) {
            return;
        }
        var translate = this.localeService.getLocaleTextFunc();
        var itemLabel = translate('ariaFilterValue', 'Filter Value');
        core._.setAriaLabel(this.focusWrapper, value + " " + itemLabel);
        core._.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
    };
    SetFilterListItem.prototype.refresh = function (item, isSelected, isExpanded) {
        var _a, _b;
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        if (this.valueFunction) {
            // underlying value might have changed, so call again and re-render
            var value = this.valueFunction();
            this.setTooltipAndCellRendererParams(value, value);
            if (!this.cellRendererComponent) {
                this.renderCellWithoutCellRenderer();
            }
        }
        (_b = (_a = this.cellRendererComponent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a, this.cellRendererParams);
    };
    SetFilterListItem.prototype.render = function () {
        var column = this.params.column;
        var value = this.value;
        var formattedValue = null;
        if (typeof value === 'function') {
            this.valueFunction = value;
            formattedValue = this.valueFunction();
            // backwards compatibility for select all in value
            value = formattedValue;
        }
        else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = core._.toStringOrNull(value);
        }
        else {
            formattedValue = this.getFormattedValue(column, value);
        }
        this.setTooltipAndCellRendererParams(value, formattedValue);
        this.renderCell();
    };
    SetFilterListItem.prototype.setTooltipAndCellRendererParams = function (value, formattedValue) {
        if (this.params.showTooltips) {
            var tooltipValue = formattedValue != null ? formattedValue : core._.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }
        this.cellRendererParams = {
            value: value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            colDef: this.params.colDef,
            column: this.params.column,
        };
    };
    SetFilterListItem.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        if (this.isTree) {
            res.level = this.depth;
        }
        return res;
    };
    SetFilterListItem.prototype.getFormattedValue = function (column, value) {
        return this.valueFormatterService.formatValue(column, null, value, this.valueFormatter, false);
    };
    SetFilterListItem.prototype.renderCell = function () {
        var _this = this;
        var compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        var cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            this.renderCellWithoutCellRenderer();
            return;
        }
        cellRendererPromise.then(function (component) {
            if (component) {
                _this.cellRendererComponent = component;
                _this.eCheckbox.setLabel(component.getGui());
                _this.addDestroyFunc(function () { return _this.destroyBean(component); });
            }
        });
    };
    SetFilterListItem.prototype.renderCellWithoutCellRenderer = function () {
        var _a;
        var valueToRender = (_a = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted)) !== null && _a !== void 0 ? _a : this.translate('blanks');
        if (typeof valueToRender !== 'string') {
            core._.doOnce(function () { return console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'); }, 'setFilterComplexObjectsValueFormatter');
            valueToRender = '';
        }
        this.eCheckbox.setLabel(valueToRender);
        this.setupFixedAriaLabels(valueToRender);
    };
    SetFilterListItem.prototype.getComponentHolder = function () {
        return this.params.column.getColDef();
    };
    SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
    SetFilterListItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    SetFilterListItem.GROUP_TEMPLATE = "\n        <div class=\"ag-set-filter-item\" aria-hidden=\"true\">\n            <span class=\"ag-set-filter-group-icons\">\n                <span class=\"ag-set-filter-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span class=\"ag-set-filter-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n                <span class=\"ag-set-filter-group-indeterminate-icon\" ref=\"eGroupIndeterminateIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    SetFilterListItem.TEMPLATE = "\n        <div class=\"ag-set-filter-item\">\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    __decorate$2([
        core.Autowired('valueFormatterService')
    ], SetFilterListItem.prototype, "valueFormatterService", void 0);
    __decorate$2([
        core.Autowired('userComponentFactory')
    ], SetFilterListItem.prototype, "userComponentFactory", void 0);
    __decorate$2([
        core.RefSelector('eCheckbox')
    ], SetFilterListItem.prototype, "eCheckbox", void 0);
    __decorate$2([
        core.RefSelector('eGroupOpenedIcon')
    ], SetFilterListItem.prototype, "eGroupOpenedIcon", void 0);
    __decorate$2([
        core.RefSelector('eGroupClosedIcon')
    ], SetFilterListItem.prototype, "eGroupClosedIcon", void 0);
    __decorate$2([
        core.RefSelector('eGroupIndeterminateIcon')
    ], SetFilterListItem.prototype, "eGroupIndeterminateIcon", void 0);
    __decorate$2([
        core.PostConstruct
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
}(core.Component));

var DEFAULT_LOCALE_TEXT = {
    loadingOoo: 'Loading...',
    blanks: '(Blanks)',
    searchOoo: 'Search...',
    selectAll: '(Select All)',
    selectAllSearchResults: '(Select All Search Results)',
    noMatches: 'No matches.'
};

var SetFilterModelFormatter = /** @class */ (function () {
    function SetFilterModelFormatter() {
    }
    SetFilterModelFormatter.prototype.getModelAsString = function (model, setFilter) {
        var values = (model || setFilter.getModel() || {}).values;
        var valueModel = setFilter.getValueModel();
        if (values == null || valueModel == null) {
            return '';
        }
        var availableKeys = values.filter(function (v) { return valueModel.isKeyAvailable(v); });
        var numValues = availableKeys.length;
        var formattedValues = availableKeys.slice(0, 10).map(function (key) { return setFilter.getFormattedValue(key); });
        return "(" + numValues + ") " + formattedValues.join(',') + (numValues > 10 ? ',...' : '');
    };
    return SetFilterModelFormatter;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** @param V type of value in the Set Filter */
var SetFilter = /** @class */ (function (_super) {
    __extends$1(SetFilter, _super);
    function SetFilter() {
        var _this = _super.call(this, 'setFilter') || this;
        _this.valueModel = null;
        _this.setFilterParams = null;
        _this.virtualList = null;
        _this.caseSensitive = false;
        _this.convertValuesToStrings = false;
        _this.treeDataTreeList = false;
        _this.groupingTreeList = false;
        _this.hardRefreshVirtualList = false;
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        _this.appliedModelKeys = null;
        _this.noAppliedModelKeys = false;
        _this.filterModelFormatter = new SetFilterModelFormatter();
        return _this;
    }
    SetFilter.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.positionableFeature = new core.PositionableFeature(this.eSetFilterList, { forcePopupParentAsOffsetParent: true });
        this.createBean(this.positionableFeature);
    };
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        return /* html */ "\n            <div class=\"ag-set-filter\">\n                <div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + this.translateForSetFilter('loadingOoo') + "</div>\n                <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                <div ref=\"eFilterNoMatches\" class=\"ag-filter-no-matches ag-hidden\">" + this.translateForSetFilter('noMatches') + "</div>\n                <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n            </div>";
    };
    SetFilter.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        if (e.defaultPrevented) {
            return;
        }
        switch (e.key) {
            case core.KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case core.KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
            case core.KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case core.KeyCode.RIGHT:
                this.handleKeyRight(e);
                break;
        }
    };
    SetFilter.prototype.handleKeySpace = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.toggleSelected();
    };
    SetFilter.prototype.handleKeyEnter = function (e) {
        if (!this.setFilterParams) {
            return;
        }
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (!excelMode || !!readOnly) {
            return;
        }
        e.preventDefault();
        // in Excel Mode, hitting Enter is the same as pressing the Apply button
        this.onBtApply(false, false, e);
        if (this.setFilterParams.excelMode === 'mac') {
            // in Mac version, select all the input text
            this.eMiniFilter.getInputElement().select();
        }
    };
    SetFilter.prototype.handleKeyLeft = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(false);
    };
    SetFilter.prototype.handleKeyRight = function (e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(true);
    };
    SetFilter.prototype.getComponentForKeyEvent = function (e) {
        var _a;
        var eDocument = this.gridOptionsService.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) {
            return;
        }
        var currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) {
            return;
        }
        var component = this.virtualList.getComponentAt(currentItem);
        if (component == null) {
            return;
        }
        e.preventDefault();
        var readOnly = ((_a = this.setFilterParams) !== null && _a !== void 0 ? _a : {}).readOnly;
        if (!!readOnly) {
            return;
        }
        return component;
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.setModel = function (model) {
        var _a;
        if (model == null && ((_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.getModel()) == null) {
            // refreshing is expensive. if new and old model are both null (e.g. nothing set), skip.
            // mini filter isn't contained within the model, so always reset
            this.setMiniFilter(null);
            return core.AgPromise.resolve();
        }
        return _super.prototype.setModel.call(this, model);
    };
    SetFilter.prototype.setModelAndRefresh = function (values) {
        var _this = this;
        return this.valueModel ? this.valueModel.setModel(values).then(function () { return _this.refresh(); }) : core.AgPromise.resolve();
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        this.setMiniFilter(null);
        return this.setModelAndRefresh(null);
    };
    SetFilter.prototype.setModelIntoUi = function (model) {
        this.setMiniFilter(null);
        var values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    };
    SetFilter.prototype.getModelFromUi = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        return { values: values, filterType: this.getFilterType() };
    };
    SetFilter.prototype.getFilterType = function () {
        return 'set';
    };
    SetFilter.prototype.getValueModel = function () {
        return this.valueModel;
    };
    SetFilter.prototype.areModelsEqual = function (a, b) {
        // both are missing
        if (a == null && b == null) {
            return true;
        }
        return a != null && b != null && core._.areEqual(a.values, b.values);
    };
    SetFilter.prototype.setParams = function (params) {
        var _this = this;
        var _a;
        this.applyExcelModeOptions(params);
        _super.prototype.setParams.call(this, params);
        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        var keyCreator = (_a = params.keyCreator) !== null && _a !== void 0 ? _a : params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        var isGroupCol = params.column.getId().startsWith(core.GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new SetValueModel({
            filterParams: params,
            setIsLoading: function (loading) { return _this.setIsLoading(loading); },
            valueFormatterService: this.valueFormatterService,
            translate: function (key) { return _this.translateForSetFilter(key); },
            caseFormat: function (v) { return _this.caseFormat(v); },
            createKey: this.createKey,
            valueFormatter: this.valueFormatter,
            usingComplexObjects: !!keyCreator,
            gridOptionsService: this.gridOptionsService,
            columnModel: this.columnModel,
            valueService: this.valueService,
            treeDataTreeList: this.treeDataTreeList,
            groupingTreeList: this.groupingTreeList
        });
        this.initialiseFilterBodyUi();
        this.addEventListenersForDataChanges();
    };
    SetFilter.prototype.setValueFormatter = function (providedValueFormatter, keyCreator, convertValuesToStrings, treeList, isRefData) {
        var valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !convertValuesToStrings && !treeList) {
                throw new Error('AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator unless convertValuesToStrings is enabled');
            }
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = function (params) { return core._.toStringOrNull(params.value); };
            }
        }
        this.valueFormatter = valueFormatter;
    };
    SetFilter.prototype.generateCreateKey = function (keyCreator, convertValuesToStrings, treeDataOrGrouping) {
        var _this = this;
        if (treeDataOrGrouping && !keyCreator) {
            throw new Error('AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled.');
        }
        if (keyCreator) {
            return function (value, node) {
                if (node === void 0) { node = null; }
                var params = _this.getKeyCreatorParams(value, node);
                return core._.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return function (value) { return Array.isArray(value) ? value : core._.makeNull(core._.toStringOrNull(value)); };
        }
        else {
            return function (value) { return core._.makeNull(core._.toStringOrNull(value)); };
        }
    };
    SetFilter.prototype.getFormattedValue = function (key) {
        var _a;
        var value = this.valueModel.getValue(key);
        // essentially get back the cell value
        if ((this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            value = value[value.length - 1];
        }
        var formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? core._.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
    };
    SetFilter.prototype.applyExcelModeOptions = function (params) {
        // apply default options to match Excel behaviour, unless they have already been specified
        if (params.excelMode === 'windows') {
            if (!params.buttons) {
                params.buttons = ['apply', 'cancel'];
            }
            if (params.closeOnApply == null) {
                params.closeOnApply = true;
            }
        }
        else if (params.excelMode === 'mac') {
            if (!params.buttons) {
                params.buttons = ['reset'];
            }
            if (params.applyMiniFilterWhileTyping == null) {
                params.applyMiniFilterWhileTyping = true;
            }
            if (params.debounceMs == null) {
                params.debounceMs = 500;
            }
        }
    };
    SetFilter.prototype.addEventListenersForDataChanges = function () {
        var _this = this;
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_CELL_VALUE_CHANGED, function (event) {
            // only interested in changes to do with this column
            if (_this.setFilterParams && event.column === _this.setFilterParams.column) {
                _this.syncAfterDataChange();
            }
        });
    };
    SetFilter.prototype.syncAfterDataChange = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var promise = this.valueModel.refreshValues();
        return promise.then(function () {
            _this.refresh();
            _this.onBtApply(false, true);
        });
    };
    SetFilter.prototype.setIsLoading = function (isLoading) {
        core._.setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        this.initVirtualList();
        this.initMiniFilter();
    };
    SetFilter.prototype.initVirtualList = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var translate = this.localeService.getLocaleTextFunc();
        var filterListName = translate('ariaFilterList', 'Filter List');
        var isTree = !!this.setFilterParams.treeList;
        var virtualList = this.virtualList = this.createBean(new core.VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        var cellHeight = this.setFilterParams.cellHeight;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        var componentCreator = function (item, listItemElement) { return _this.createSetListItem(item, isTree, listItemElement); };
        virtualList.setComponentCreator(componentCreator);
        var componentUpdater = function (item, component) { return _this.updateSetListItem(item, component); };
        virtualList.setComponentUpdater(componentUpdater);
        var model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, function () { return _this.isSelectAllSelected(); });
        }
        if (isTree) {
            model = new TreeModelWrapper(model);
        }
        virtualList.setModel(model);
    };
    SetFilter.prototype.getSelectAllLabel = function () {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';
        return this.translateForSetFilter(key);
    };
    SetFilter.prototype.createSetListItem = function (item, isTree, focusWrapper) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var groupsExist = this.valueModel.hasGroups();
        var value;
        var depth;
        var isGroup;
        var hasIndeterminateExpandState;
        var selectedListener;
        var expandedListener;
        if (this.isSetFilterModelTreeItem(item)) {
            depth = item.depth;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                // select all
                value = function () { return _this.getSelectAllLabel(); };
                isGroup = groupsExist;
                hasIndeterminateExpandState = true;
                selectedListener = function (e) { return _this.onSelectAll(e.isSelected); };
                expandedListener = function (e) { return _this.onExpandAll(e.item, e.isExpanded); };
            }
            else if (item.children) {
                // group
                value = (_c = (_b = (_a = this.setFilterParams).treeListFormatter) === null || _b === void 0 ? void 0 : _b.call(_a, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _c !== void 0 ? _c : item.treeKey;
                isGroup = true;
                selectedListener = function (e) { return _this.onGroupItemSelected(e.item, e.isSelected); };
                expandedListener = function (e) { return _this.onExpandedChanged(e.item, e.isExpanded); };
            }
            else {
                // leaf
                value = (_f = (_e = (_d = this.setFilterParams).treeListFormatter) === null || _e === void 0 ? void 0 : _e.call(_d, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _f !== void 0 ? _f : item.treeKey;
                selectedListener = function (e) { return _this.onItemSelected(e.item.key, e.isSelected); };
            }
        }
        else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                value = function () { return _this.getSelectAllLabel(); };
                selectedListener = function (e) { return _this.onSelectAll(e.isSelected); };
            }
            else {
                value = this.valueModel.getValue(item);
                selectedListener = function (e) { return _this.onItemSelected(e.item, e.isSelected); };
            }
        }
        var _g = this.isSelectedExpanded(item), isSelected = _g.isSelected, isExpanded = _g.isExpanded;
        var itemParams = {
            focusWrapper: focusWrapper,
            value: value,
            params: this.setFilterParams,
            translate: function (translateKey) { return _this.translateForSetFilter(translateKey); },
            valueFormatter: this.valueFormatter,
            item: item,
            isSelected: isSelected,
            isTree: isTree,
            depth: depth,
            groupsExist: groupsExist,
            isGroup: isGroup,
            isExpanded: isExpanded,
            hasIndeterminateExpandState: hasIndeterminateExpandState,
        };
        var listItem = this.createBean(new SetFilterListItem(itemParams));
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
        }
        return listItem;
    };
    SetFilter.prototype.updateSetListItem = function (item, component) {
        var _a = this.isSelectedExpanded(item), isSelected = _a.isSelected, isExpanded = _a.isExpanded;
        component.refresh(item, isSelected, isExpanded);
    };
    SetFilter.prototype.isSelectedExpanded = function (item) {
        var isSelected;
        var isExpanded;
        if (this.isSetFilterModelTreeItem(item)) {
            isExpanded = item.expanded;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            }
            else if (item.children) {
                isSelected = this.areAllChildrenSelected(item);
            }
            else {
                isSelected = this.valueModel.isKeySelected(item.key);
            }
        }
        else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            }
            else {
                isSelected = this.valueModel.isKeySelected(item);
            }
        }
        return { isSelected: isSelected, isExpanded: isExpanded };
    };
    SetFilter.prototype.isSetFilterModelTreeItem = function (item) {
        return (item === null || item === void 0 ? void 0 : item.treeKey) !== undefined;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var _a = this, eMiniFilter = _a.eMiniFilter, localeService = _a.localeService;
        var translate = localeService.getLocaleTextFunc();
        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));
        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
    };
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    SetFilter.prototype.afterGuiAttached = function (params) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        _super.prototype.afterGuiAttached.call(this, params);
        // collapse all tree list items (if tree list)
        this.resetExpansion();
        this.refreshVirtualList();
        var eMiniFilter = this.eMiniFilter;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
        var resizable = !!(params && params.container === 'floatingFilter');
        var resizableObject;
        if (this.gridOptionsService.is('enableRtl')) {
            resizableObject = { bottom: true, bottomLeft: true, left: true };
        }
        else {
            resizableObject = { bottom: true, bottomRight: true, right: true };
        }
        if (resizable) {
            this.positionableFeature.restoreLastSize();
            this.positionableFeature.setResizable(resizableObject);
        }
        else {
            this.positionableFeature.removeSizeFromEl();
            this.positionableFeature.setResizable(false);
        }
    };
    SetFilter.prototype.afterGuiDetached = function () {
        var _a;
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }
    };
    SetFilter.prototype.applyModel = function (source) {
        var _this = this;
        if (source === void 0) { source = 'api'; }
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (this.setFilterParams.excelMode && source !== 'rowDataUpdated' && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }
        var result = _super.prototype.applyModel.call(this, source);
        // keep appliedModelKeys in sync with the applied model
        var appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelKeys = new Set();
            appliedModel.values.forEach(function (key) {
                _this.appliedModelKeys.add(_this.caseFormat(key));
            });
        }
        else {
            this.appliedModelKeys = null;
        }
        this.noAppliedModelKeys = (appliedModel === null || appliedModel === void 0 ? void 0 : appliedModel.values.length) === 0;
        return result;
    };
    SetFilter.prototype.isModelValid = function (model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelKeys) {
            return true;
        }
        // if nothing selected, don't need to check value
        if (this.noAppliedModelKeys) {
            return false;
        }
        var node = params.node, data = params.data;
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, data);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, data);
        }
        var value = this.getValueFromNode(node, data);
        if (this.convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return this.doesFilterPassForConvertValuesToString(node, value);
        }
        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return value.some(function (v) { return _this.isInAppliedModel(_this.createKey(v, node)); });
        }
        return this.isInAppliedModel(this.createKey(value, node));
    };
    SetFilter.prototype.doesFilterPassForConvertValuesToString = function (node, value) {
        var _this = this;
        var key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            if (key.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return key.some(function (v) { return _this.isInAppliedModel(v); });
        }
        return this.isInAppliedModel(key);
    };
    SetFilter.prototype.doesFilterPassForTreeData = function (node, data) {
        var _a;
        if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath(data))));
    };
    SetFilter.prototype.doesFilterPassForGrouping = function (node, data) {
        var _this = this;
        var dataPath = this.columnModel.getRowGroupColumns().map(function (groupCol) { return _this.valueService.getKeyForNode(groupCol, node); });
        dataPath.push(this.getValueFromNode(node, data));
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath)));
    };
    SetFilter.prototype.checkMakeNullDataPath = function (dataPath) {
        if (dataPath) {
            dataPath = dataPath.map(function (treeKey) { return core._.toStringOrNull(core._.makeNull(treeKey)); });
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(function (treeKey) { return treeKey == null; })) {
            return null;
        }
        return dataPath;
    };
    SetFilter.prototype.isInAppliedModel = function (key) {
        return this.appliedModelKeys.has(this.caseFormat(key));
    };
    SetFilter.prototype.getValueFromNode = function (node, data) {
        var _a = this.setFilterParams, valueGetter = _a.valueGetter, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        return valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: data,
            getValue: function (field) { return data[field]; },
            node: node,
        });
    };
    SetFilter.prototype.getKeyCreatorParams = function (value, node) {
        if (node === void 0) { node = null; }
        return {
            value: value,
            colDef: this.setFilterParams.colDef,
            column: this.setFilterParams.column,
            node: node,
            data: node === null || node === void 0 ? void 0 : node.data,
            api: this.setFilterParams.api,
            columnApi: this.setFilterParams.columnApi,
            context: this.setFilterParams.context
        };
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.syncAfterDataChange();
    };
    SetFilter.prototype.isValuesTakenFromGrid = function () {
        if (!this.valueModel) {
            return false;
        }
        var valuesType = this.valueModel.getValuesType();
        return valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param values The values to use.
     */
    SetFilter.prototype.setFilterValues = function (values) {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(values).then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    SetFilter.prototype.resetFilterValues = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange();
    };
    SetFilter.prototype.refreshFilterValues = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshValues().then(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        var _this = this;
        // don't block the current action when updating the values for this filter
        setTimeout(function () {
            if (!_this.isAlive()) {
                return;
            }
            if (!_this.valueModel) {
                throw new Error('Value model has not been created.');
            }
            _this.valueModel.refreshAfterAnyFilterChanged().then(function (refresh) {
                if (refresh) {
                    _this.refresh();
                    _this.showOrHideResults();
                }
            });
        }, 0);
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            return;
        }
        var _a = this.setFilterParams || {}, applyMiniFilterWhileTyping = _a.applyMiniFilterWhileTyping, readOnly = _a.readOnly;
        if (!readOnly && applyMiniFilterWhileTyping) {
            this.filterOnAllVisibleValues(false);
        }
        else {
            this.updateUiAfterMiniFilterChange();
        }
    };
    SetFilter.prototype.updateUiAfterMiniFilterChange = function () {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (excelMode == null || !!readOnly) {
            this.refresh();
        }
        else if (this.valueModel.getMiniFilter() == null) {
            this.resetUiToActiveModel();
        }
        else {
            this.valueModel.selectAllMatchingMiniFilter(true);
            this.refresh();
            this.onUiChanged();
        }
        this.showOrHideResults();
    };
    SetFilter.prototype.showOrHideResults = function () {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        var hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        core._.setDisplayed(this.eNoMatches, hideResults);
        core._.setDisplayed(this.eSetFilterList, !hideResults);
    };
    SetFilter.prototype.resetUiToActiveModel = function () {
        var _this = this;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(function () { return _this.onUiChanged(false, 'prevent'); });
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        var _a = this.setFilterParams || {}, excelMode = _a.excelMode, readOnly = _a.readOnly;
        if (e.key === core.KeyCode.ENTER && !excelMode && !readOnly) {
            this.filterOnAllVisibleValues();
        }
    };
    SetFilter.prototype.filterOnAllVisibleValues = function (applyImmediately) {
        if (applyImmediately === void 0) { applyImmediately = true; }
        var readOnly = (this.setFilterParams || {}).readOnly;
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!!readOnly) {
            throw new Error('Unable to filter in readOnly mode.');
        }
        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
        this.showOrHideResults();
    };
    SetFilter.prototype.focusRowIfAlive = function (rowIndex) {
        var _this = this;
        if (rowIndex == null) {
            return;
        }
        window.setTimeout(function () {
            if (!_this.virtualList) {
                throw new Error('Virtual list has not been created.');
            }
            if (_this.isAlive()) {
                _this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    };
    SetFilter.prototype.onSelectAll = function (isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        if (isSelected) {
            this.valueModel.selectAllMatchingMiniFilter();
        }
        else {
            this.valueModel.deselectAllMatchingMiniFilter();
        }
        this.refreshAfterSelection();
    };
    SetFilter.prototype.onGroupItemSelected = function (item, isSelected) {
        var _this = this;
        var recursiveGroupSelection = function (i) {
            if (i.children) {
                i.children.forEach(function (childItem) { return recursiveGroupSelection(childItem); });
            }
            else {
                _this.selectItem(i.key, isSelected);
            }
        };
        recursiveGroupSelection(item);
        this.refreshAfterSelection();
    };
    SetFilter.prototype.onItemSelected = function (key, isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.selectItem(key, isSelected);
        this.refreshAfterSelection();
    };
    SetFilter.prototype.selectItem = function (key, isSelected) {
        if (isSelected) {
            this.valueModel.selectKey(key);
        }
        else {
            this.valueModel.deselectKey(key);
        }
    };
    SetFilter.prototype.onExpandAll = function (item, isExpanded) {
        var recursiveExpansion = function (i) {
            if (i.filterPasses && i.available && i.children) {
                i.children.forEach(function (childItem) { return recursiveExpansion(childItem); });
                i.expanded = isExpanded;
            }
        };
        recursiveExpansion(item);
        this.refreshAfterExpansion();
    };
    SetFilter.prototype.onExpandedChanged = function (item, isExpanded) {
        item.expanded = isExpanded;
        this.refreshAfterExpansion();
    };
    SetFilter.prototype.refreshAfterExpansion = function () {
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.valueModel.updateDisplayedValues('expansion');
        this.refresh();
        this.focusRowIfAlive(focusedRow);
    };
    SetFilter.prototype.refreshAfterSelection = function () {
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    };
    SetFilter.prototype.getMiniFilter = function () {
        return this.valueModel ? this.valueModel.getMiniFilter() : null;
    };
    SetFilter.prototype.refresh = function () {
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.virtualList.refresh(!this.hardRefreshVirtualList);
        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    };
    SetFilter.prototype.getFilterKeys = function () {
        return this.valueModel ? this.valueModel.getKeys() : [];
    };
    SetFilter.prototype.getFilterValues = function () {
        return this.valueModel ? this.valueModel.getValues() : [];
    };
    SetFilter.prototype.getValues = function () {
        return this.getFilterKeys();
    };
    SetFilter.prototype.refreshVirtualList = function () {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.refresh();
        }
    };
    SetFilter.prototype.translateForSetFilter = function (key) {
        var translate = this.localeService.getLocaleTextFunc();
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
    };
    SetFilter.prototype.isSelectAllSelected = function () {
        if (!this.setFilterParams || !this.valueModel) {
            return false;
        }
        if (!this.setFilterParams.defaultToNothingSelected) {
            // everything selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isNothingVisibleSelected()) {
                return false;
            }
            if (this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }
        }
        else {
            // nothing selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }
            if (this.valueModel.isNothingVisibleSelected()) {
                return false;
            }
        }
        // returning `undefined` means the checkbox status is indeterminate.
        return undefined;
    };
    SetFilter.prototype.areAllChildrenSelected = function (item) {
        var _this = this;
        var recursiveChildSelectionCheck = function (i) {
            if (i.children) {
                var someTrue_1 = false;
                var someFalse_1 = false;
                var mixed = i.children.some(function (child) {
                    if (!child.filterPasses || !child.available) {
                        return false;
                    }
                    var childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        return true;
                    }
                    if (childSelected) {
                        someTrue_1 = true;
                    }
                    else {
                        someFalse_1 = true;
                    }
                    return someTrue_1 && someFalse_1;
                });
                // returning `undefined` means the checkbox status is indeterminate.
                // if not mixed and some true, all must be true
                return mixed ? undefined : someTrue_1;
            }
            else {
                return _this.valueModel.isKeySelected(i.key);
            }
        };
        if (!this.setFilterParams.defaultToNothingSelected) {
            // everything selected by default
            return recursiveChildSelectionCheck(item);
        }
        else {
            // nothing selected by default
            return this.valueModel.hasSelections() && recursiveChildSelectionCheck(item);
        }
    };
    SetFilter.prototype.destroy = function () {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }
        _super.prototype.destroy.call(this);
    };
    SetFilter.prototype.caseFormat = function (valueToFormat) {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase();
    };
    SetFilter.prototype.resetExpansion = function () {
        var _a, _b;
        if (!((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.treeList)) {
            return;
        }
        var selectAllItem = (_b = this.valueModel) === null || _b === void 0 ? void 0 : _b.getSelectAllItem();
        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            var recursiveCollapse_1 = function (i) {
                if (i.children) {
                    i.children.forEach(function (childItem) { return recursiveCollapse_1(childItem); });
                    i.expanded = false;
                }
            };
            recursiveCollapse_1(selectAllItem);
            this.valueModel.updateDisplayedValues('expansion');
        }
    };
    SetFilter.prototype.getModelAsString = function (model) {
        return this.filterModelFormatter.getModelAsString(model, this);
    };
    __decorate$1([
        core.RefSelector('eMiniFilter')
    ], SetFilter.prototype, "eMiniFilter", void 0);
    __decorate$1([
        core.RefSelector('eFilterLoading')
    ], SetFilter.prototype, "eFilterLoading", void 0);
    __decorate$1([
        core.RefSelector('eSetFilterList')
    ], SetFilter.prototype, "eSetFilterList", void 0);
    __decorate$1([
        core.RefSelector('eFilterNoMatches')
    ], SetFilter.prototype, "eNoMatches", void 0);
    __decorate$1([
        core.Autowired('valueFormatterService')
    ], SetFilter.prototype, "valueFormatterService", void 0);
    __decorate$1([
        core.Autowired('columnModel')
    ], SetFilter.prototype, "columnModel", void 0);
    __decorate$1([
        core.Autowired('valueService')
    ], SetFilter.prototype, "valueService", void 0);
    return SetFilter;
}(core.ProvidedFilter));
var ModelWrapper = /** @class */ (function () {
    function ModelWrapper(model) {
        this.model = model;
    }
    ModelWrapper.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount();
    };
    ModelWrapper.prototype.getRow = function (index) {
        return this.model.getDisplayedItem(index);
    };
    ModelWrapper.prototype.isRowSelected = function (index) {
        return this.model.isKeySelected(this.getRow(index));
    };
    ModelWrapper.prototype.areRowsEqual = function (oldRow, newRow) {
        return oldRow === newRow;
    };
    return ModelWrapper;
}());
var ModelWrapperWithSelectAll = /** @class */ (function () {
    function ModelWrapperWithSelectAll(model, isSelectAllSelected) {
        this.model = model;
        this.isSelectAllSelected = isSelectAllSelected;
    }
    ModelWrapperWithSelectAll.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount() + 1;
    };
    ModelWrapperWithSelectAll.prototype.getRow = function (index) {
        return index === 0 ? this.model.getSelectAllItem() : this.model.getDisplayedItem(index - 1);
    };
    ModelWrapperWithSelectAll.prototype.isRowSelected = function (index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isKeySelected(this.getRow(index));
    };
    ModelWrapperWithSelectAll.prototype.areRowsEqual = function (oldRow, newRow) {
        return oldRow === newRow;
    };
    return ModelWrapperWithSelectAll;
}());
// isRowSelected is used by VirtualList to add aria tags for flat lists. We want to suppress this when using trees
var TreeModelWrapper = /** @class */ (function () {
    function TreeModelWrapper(model) {
        this.model = model;
    }
    TreeModelWrapper.prototype.getRowCount = function () {
        return this.model.getRowCount();
    };
    TreeModelWrapper.prototype.getRow = function (index) {
        return this.model.getRow(index);
    };
    TreeModelWrapper.prototype.areRowsEqual = function (oldRow, newRow) {
        if (oldRow == null && newRow == null) {
            return true;
        }
        return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
    };
    return TreeModelWrapper;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SetFloatingFilterComp = /** @class */ (function (_super) {
    __extends(SetFloatingFilterComp, _super);
    function SetFloatingFilterComp() {
        var _this = _super.call(this, /* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eFloatingFilterText\"></ag-input-text-field>\n            </div>") || this;
        _this.availableValuesListenerAdded = false;
        _this.filterModelFormatter = new SetFilterModelFormatter();
        return _this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    SetFloatingFilterComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    SetFloatingFilterComp.prototype.init = function (params) {
        var displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        var translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(displayName + " " + translate('ariaFilterInput', 'Filter Input'))
            .addGuiEventListener('click', function () { return params.showParentFilter(); });
        this.params = params;
    };
    SetFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.updateFloatingFilterText(parentModel);
    };
    SetFloatingFilterComp.prototype.parentSetFilterInstance = function (cb) {
        this.params.parentFilterInstance(function (filter) {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as its parent');
            }
            cb(filter);
        });
    };
    SetFloatingFilterComp.prototype.addAvailableValuesListener = function () {
        var _this = this;
        this.parentSetFilterInstance(function (setFilter) {
            var setValueModel = setFilter.getValueModel();
            if (!setValueModel) {
                return;
            }
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            _this.addManagedListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, function () { return _this.updateFloatingFilterText(); });
        });
        this.availableValuesListenerAdded = true;
    };
    SetFloatingFilterComp.prototype.updateFloatingFilterText = function (parentModel) {
        var _this = this;
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }
        this.parentSetFilterInstance(function (setFilter) {
            _this.eFloatingFilterText.setValue(_this.filterModelFormatter.getModelAsString(parentModel, setFilter));
        });
    };
    __decorate([
        core.RefSelector('eFloatingFilterText')
    ], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
    __decorate([
        core.Autowired('columnModel')
    ], SetFloatingFilterComp.prototype, "columnModel", void 0);
    return SetFloatingFilterComp;
}(core.Component));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.1.0';

var SetFilterModule = {
    version: VERSION,
    moduleName: core.ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: SetFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp },
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.SetFilter = SetFilter;
exports.SetFilterModule = SetFilterModule;
