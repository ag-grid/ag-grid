/**
          * @ag-grid-enterprise/set-filter - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { _, EventService, TextFilter, AgPromise, Autowired, RefSelector, PostConstruct, Component, ProvidedFilter, KeyCode, GROUP_AUTO_COLUMN_ID, Events, VirtualList, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

/** @param V type of value in the Set Filter */
class ClientSideValuesExtractor {
    constructor(rowModel, filterParams, createKey, caseFormat, columnModel, valueService, treeDataOrGrouping, treeData, getDataPath) {
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
    extractUniqueValues(predicate, existingValues) {
        const values = new Map();
        const existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
        const formattedKeys = new Set();
        const treeData = this.treeData && !!this.getDataPath;
        const groupedCols = this.columnModel.getRowGroupColumns();
        const addValue = (unformattedKey, value) => {
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                let keyToAdd = unformattedKey;
                let valueToAdd = _.makeNull(value);
                // when case insensitive, we pick the first value to use. if this is later filtered out,
                // we still want to use the original value and not one with a different case
                const existingUnformattedKey = existingFormattedKeys === null || existingFormattedKeys === void 0 ? void 0 : existingFormattedKeys.get(formattedKey);
                if (existingUnformattedKey != null) {
                    keyToAdd = existingUnformattedKey;
                    valueToAdd = existingValues.get(existingUnformattedKey);
                }
                values.set(keyToAdd, valueToAdd);
            }
        };
        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            if (this.treeDataOrGrouping) {
                this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue);
                return;
            }
            let value = this.getValue(node);
            if (this.filterParams.convertValuesToStrings) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                this.addValueForConvertValuesToString(node, value, addValue);
                return;
            }
            if (value != null && Array.isArray(value)) {
                value.forEach(x => {
                    addValue(this.createKey(x, node), x);
                });
                if (value.length === 0) {
                    addValue(null, null);
                }
            }
            else {
                addValue(this.createKey(value, node), value);
            }
        });
        return values;
    }
    addValueForConvertValuesToString(node, value, addValue) {
        const key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            key.forEach(part => {
                const processedPart = _.toStringOrNull(_.makeNull(part));
                addValue(processedPart, processedPart);
            });
            if (key.length === 0) {
                addValue(null, null);
            }
        }
        else {
            addValue(key, key);
        }
    }
    addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue) {
        var _a;
        let dataPath;
        if (treeData) {
            if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
                return;
            }
            dataPath = this.getDataPath(node.data);
        }
        else {
            dataPath = groupedCols.map(groupCol => this.valueService.getKeyForNode(groupCol, node));
            dataPath.push(this.getValue(node));
        }
        if (dataPath) {
            dataPath = dataPath.map(treeKey => _.toStringOrNull(_.makeNull(treeKey)));
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(treeKey => treeKey == null)) {
            dataPath = null;
        }
        addValue(this.createKey(dataPath), dataPath);
    }
    getValue(node) {
        const { api, colDef, column, columnApi, context } = this.filterParams;
        return this.filterParams.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        });
    }
    extractExistingFormattedKeys(existingValues) {
        if (!existingValues) {
            return null;
        }
        const existingFormattedKeys = new Map();
        existingValues.forEach((_value, key) => {
            existingFormattedKeys.set(this.caseFormat(key), key);
        });
        return existingFormattedKeys;
    }
}

class SetFilterDisplayValue {
}
SetFilterDisplayValue.SELECT_ALL = '__AG_SELECT_ALL__';

class FlatSetDisplayValueModel {
    constructor(valueFormatterService, valueFormatter, formatter, column) {
        this.valueFormatterService = valueFormatterService;
        this.valueFormatter = valueFormatter;
        this.formatter = formatter;
        this.column = column;
        /** All keys that are currently displayed, after the mini-filter has been applied. */
        this.displayedKeys = [];
    }
    updateDisplayedValuesToAllAvailable(_getValue, _allKeys, availableKeys) {
        this.displayedKeys = Array.from(availableKeys);
    }
    updateDisplayedValuesToMatchMiniFilter(getValue, _allKeys, availableKeys, matchesFilter, nullMatchesFilter) {
        this.displayedKeys = [];
        for (let key of availableKeys) {
            if (key == null) {
                if (nullMatchesFilter) {
                    this.displayedKeys.push(key);
                }
            }
            else {
                const value = getValue(key);
                const valueFormatterValue = this.valueFormatterService.formatValue(this.column, null, value, this.valueFormatter, false);
                const textFormatterValue = this.formatter(valueFormatterValue);
                if (matchesFilter(textFormatterValue)) {
                    this.displayedKeys.push(key);
                }
            }
        }
    }
    getDisplayedValueCount() {
        return this.displayedKeys.length;
    }
    getDisplayedItem(index) {
        return this.displayedKeys[index];
    }
    getSelectAllItem() {
        return SetFilterDisplayValue.SELECT_ALL;
    }
    getDisplayedKeys() {
        return this.displayedKeys;
    }
    forEachDisplayedKey(func) {
        this.displayedKeys.forEach(func);
    }
    someDisplayedKey(func) {
        return this.displayedKeys.some(func);
    }
    hasGroups() {
        return false;
    }
    refresh() {
        // not used
    }
}

class TreeSetDisplayValueModel {
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

var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType || (SetFilterModelValuesType = {}));
/** @param V type of value in the Set Filter */
class SetValueModel {
    constructor(params) {
        var _a;
        this.localEventService = new EventService();
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
        const { usingComplexObjects, columnModel, valueService, treeDataTreeList, groupingTreeList, filterParams, gridOptionsService, valueFormatterService, valueFormatter } = params;
        const { column, colDef, textFormatter, doesRowPassOtherFilter, suppressSorting, comparator, rowModel, values, caseSensitive, convertValuesToStrings, treeList, treeListPathGetter, treeListFormatter } = filterParams;
        this.filterParams = filterParams;
        this.setIsLoading = params.setIsLoading;
        this.translate = params.translate;
        this.caseFormat = params.caseFormat;
        this.createKey = params.createKey;
        this.usingComplexObjects = !!params.usingComplexObjects;
        this.formatter = textFormatter || TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.convertValuesToStrings = !!convertValuesToStrings;
        const keyComparator = comparator !== null && comparator !== void 0 ? comparator : colDef.comparator;
        const treeDataOrGrouping = !!treeDataTreeList || !!groupingTreeList;
        // If using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys.
        // Also if tree data, grouping, or date with tree list, then need to do value sort
        this.compareByValue = !!((usingComplexObjects && keyComparator) || treeDataOrGrouping || (treeList && !treeListPathGetter));
        if (treeDataOrGrouping && !keyComparator) {
            this.entryComparator = this.createTreeDataOrGroupingComparator();
        }
        else if (treeList && !treeListPathGetter && !keyComparator) {
            this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => _.defaultComparator(aValue, bValue);
        }
        else {
            this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => keyComparator(aValue, bValue);
        }
        this.keyComparator = (_a = keyComparator) !== null && _a !== void 0 ? _a : _.defaultComparator;
        this.caseSensitive = !!caseSensitive;
        const getDataPath = gridOptionsService.get('getDataPath');
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
        this.updateAllValues().then(updatedKeys => this.resetSelectionState(updatedKeys || []));
    }
    addEventListener(eventType, listener, async) {
        this.localEventService.addEventListener(eventType, listener, async);
    }
    removeEventListener(eventType, listener, async) {
        this.localEventService.removeEventListener(eventType, listener, async);
    }
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    refreshValues() {
        const currentModel = this.getModel();
        this.updateAllValues();
        // ensure model is updated for new values
        return this.setModel(currentModel);
    }
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    overrideValues(valuesToUse) {
        return new AgPromise(resolve => {
            // wait for any existing values to be populated before overriding
            this.allValuesPromise.then(() => {
                this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                this.providedValues = valuesToUse;
                this.refreshValues().then(() => resolve());
            });
        });
    }
    /** @return has anything been updated */
    refreshAfterAnyFilterChanged() {
        if (this.showAvailableOnly()) {
            return this.allValuesPromise.then(keys => {
                this.updateAvailableKeys(keys !== null && keys !== void 0 ? keys : [], 'otherFilter');
                return true;
            });
        }
        return AgPromise.resolve(false);
    }
    isInitialised() {
        return this.initialised;
    }
    updateAllValues() {
        this.allValuesPromise = new AgPromise(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(this.processAllKeys(this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, this.providedValues));
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);
                    const callback = this.providedValues;
                    const { columnApi, api, context, column, colDef } = this.filterParams;
                    const params = {
                        success: values => {
                            this.setIsLoading(false);
                            resolve(this.processAllKeys(false, values));
                        },
                        colDef,
                        column,
                        columnApi,
                        api,
                        context,
                    };
                    window.setTimeout(() => callback(params), 0);
                    break;
                }
                default:
                    throw new Error('Unrecognised valuesType');
            }
        });
        this.allValuesPromise.then(values => this.updateAvailableKeys(values || [], 'reload')).then(() => this.initialised = true);
        return this.allValuesPromise;
    }
    processAllKeys(getFromRows, providedValues) {
        const values = getFromRows ? this.getValuesFromRows(false) : this.uniqueValues(this.validateProvidedValues(providedValues));
        const sortedKeys = this.sortKeys(values);
        this.allValues = values !== null && values !== void 0 ? values : new Map();
        return sortedKeys;
    }
    validateProvidedValues(values) {
        if (this.usingComplexObjects && (values === null || values === void 0 ? void 0 : values.length)) {
            const firstValue = values[0];
            if (firstValue && typeof firstValue !== 'object' && typeof firstValue !== 'function') {
                const firstKey = this.createKey(firstValue);
                if (firstKey == null) {
                    _.doOnce(() => console.warn('Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'), 'setFilterComplexObjectsProvidedNull');
                }
                else {
                    _.doOnce(() => console.warn('AG Grid: Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects or enable convertValuesToStrings?'), 'setFilterComplexObjectsProvidedPrimitive');
                }
            }
        }
        return values;
    }
    setValuesType(value) {
        this.valuesType = value;
    }
    getValuesType() {
        return this.valuesType;
    }
    isKeyAvailable(key) {
        return this.availableKeys.has(key);
    }
    showAvailableOnly() {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }
    updateAvailableKeys(allKeys, source) {
        const availableKeys = this.showAvailableOnly() ? this.sortKeys(this.getValuesFromRows(true)) : allKeys;
        this.availableKeys = new Set(availableKeys);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
        this.updateDisplayedValues(source, allKeys);
    }
    sortKeys(nullableValues) {
        const values = nullableValues !== null && nullableValues !== void 0 ? nullableValues : new Map();
        if (this.suppressSorting) {
            return Array.from(values.keys());
        }
        let sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries()).sort(this.entryComparator).map(([key]) => key);
        }
        else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }
        if (this.filterParams.excelMode && values.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter(v => v != null);
            sortedKeys.push(null);
        }
        return sortedKeys;
    }
    getValuesFromRows(removeUnavailableValues = false) {
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return null;
        }
        const predicate = (node) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));
        return this.clientSideValuesExtractor.extractUniqueValues(predicate, removeUnavailableValues && !this.caseSensitive ? this.allValues : undefined);
    }
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value) {
        value = _.makeNull(value);
        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilterText = value;
        this.updateDisplayedValues('miniFilter');
        return true;
    }
    getMiniFilter() {
        return this.miniFilterText;
    }
    updateDisplayedValues(source, allKeys) {
        if (source === 'expansion') {
            this.displayValueModel.refresh();
            return;
        }
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayValueModel.updateDisplayedValuesToAllAvailable((key) => this.getValue(key), allKeys, this.availableKeys, source);
            return;
        }
        // if filter present, we filter down the list
        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');
        const matchesFilter = (valueToCheck) => valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;
        const nullMatchesFilter = !!this.filterParams.excelMode && matchesFilter(this.translate('blanks'));
        this.displayValueModel.updateDisplayedValuesToMatchMiniFilter((key) => this.getValue(key), allKeys, this.availableKeys, matchesFilter, nullMatchesFilter, source);
    }
    getDisplayedValueCount() {
        return this.displayValueModel.getDisplayedValueCount();
    }
    getDisplayedItem(index) {
        return this.displayValueModel.getDisplayedItem(index);
    }
    getSelectAllItem() {
        return this.displayValueModel.getSelectAllItem();
    }
    hasSelections() {
        return this.filterParams.defaultToNothingSelected ?
            this.selectedKeys.size > 0 :
            this.allValues.size !== this.selectedKeys.size;
    }
    getKeys() {
        return Array.from(this.allValues.keys());
    }
    getValues() {
        return Array.from(this.allValues.values());
    }
    getValue(key) {
        return this.allValues.get(key);
    }
    selectAllMatchingMiniFilter(clearExistingSelection = false) {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedKeys = new Set(this.allValues.keys());
        }
        else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedKeys.clear();
            }
            this.displayValueModel.forEachDisplayedKey(key => this.selectedKeys.add(key));
        }
    }
    deselectAllMatchingMiniFilter() {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedKeys.clear();
        }
        else {
            // ensure everything that matches the mini filter is deselected
            this.displayValueModel.forEachDisplayedKey(key => this.selectedKeys.delete(key));
        }
    }
    selectKey(key) {
        this.selectedKeys.add(key);
    }
    deselectKey(key) {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
        }
        this.selectedKeys.delete(key);
    }
    isKeySelected(key) {
        return this.selectedKeys.has(key);
    }
    isEverythingVisibleSelected() {
        return !this.displayValueModel.someDisplayedKey(it => !this.isKeySelected(it));
    }
    isNothingVisibleSelected() {
        return !this.displayValueModel.someDisplayedKey(it => this.isKeySelected(it));
    }
    getModel() {
        return this.hasSelections() ? Array.from(this.selectedKeys) : null;
    }
    setModel(model) {
        return this.allValuesPromise.then(keys => {
            if (model == null) {
                this.resetSelectionState(keys !== null && keys !== void 0 ? keys : []);
            }
            else {
                // select all values from the model that exist in the filter
                this.selectedKeys.clear();
                const existingFormattedKeys = new Map();
                this.allValues.forEach((_value, key) => {
                    existingFormattedKeys.set(this.caseFormat(key), key);
                });
                model.forEach(unformattedKey => {
                    const formattedKey = this.caseFormat(unformattedKey);
                    const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
                    if (existingUnformattedKey !== undefined) {
                        this.selectKey(existingUnformattedKey);
                    }
                });
            }
        });
    }
    uniqueValues(values) {
        const uniqueValues = new Map();
        const formattedKeys = new Set();
        (values !== null && values !== void 0 ? values : []).forEach(value => {
            const valueToUse = _.makeNull(value);
            const unformattedKey = this.convertAndGetKey(valueToUse);
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        });
        return uniqueValues;
    }
    convertAndGetKey(value) {
        return this.convertValuesToStrings ? value : this.createKey(value);
    }
    resetSelectionState(keys) {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedKeys.clear();
        }
        else {
            this.selectedKeys = new Set(keys);
        }
    }
    hasGroups() {
        return this.displayValueModel.hasGroups();
    }
    createTreeDataOrGroupingComparator() {
        return ([_aKey, aValue], [_bKey, bValue]) => {
            if (aValue == null) {
                return bValue == null ? 0 : -1;
            }
            else if (bValue == null) {
                return 1;
            }
            for (let i = 0; i < aValue.length; i++) {
                if (i >= bValue.length) {
                    return 1;
                }
                const diff = _.defaultComparator(aValue[i], bValue[i]);
                if (diff !== 0) {
                    return diff;
                }
            }
            return 0;
        };
    }
}
SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** @param V type of value in the Set Filter */
class SetFilterListItem extends Component {
    constructor(params) {
        var _a;
        super(params.isGroup ? SetFilterListItem.GROUP_TEMPLATE : SetFilterListItem.TEMPLATE);
        this.focusWrapper = params.focusWrapper;
        this.value = params.value;
        this.params = params.params;
        this.translate = params.translate;
        this.valueFormatter = params.valueFormatter;
        this.item = params.item;
        this.isSelected = params.isSelected;
        this.isTree = params.isTree;
        this.depth = (_a = params.depth) !== null && _a !== void 0 ? _a : 0;
        this.isGroup = params.isGroup;
        this.groupsExist = params.groupsExist;
        this.isExpanded = params.isExpanded;
        this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
    }
    init() {
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
            _.setAriaLevel(this.focusWrapper, this.depth + 1);
        }
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange((value) => this.onCheckboxChanged(!!value));
    }
    setupExpansion() {
        this.eGroupClosedIcon.appendChild(_.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(_.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
            this.addManagedListener(this.eGroupIndeterminateIcon, 'click', this.onExpandOrContractClicked.bind(this));
        }
        this.setExpandedIcons();
        this.refreshAriaExpanded();
    }
    onExpandOrContractClicked() {
        this.setExpanded(!this.isExpanded);
    }
    setExpanded(isExpanded, silent) {
        if (this.isGroup && isExpanded !== this.isExpanded) {
            this.isExpanded = isExpanded;
            const event = {
                type: SetFilterListItem.EVENT_EXPANDED_CHANGED,
                isExpanded: !!isExpanded,
                item: this.item
            };
            if (!silent) {
                this.dispatchEvent(event);
            }
            this.setExpandedIcons();
            this.refreshAriaExpanded();
        }
    }
    refreshAriaExpanded() {
        _.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    }
    setExpandedIcons() {
        _.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        _.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            _.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
        }
    }
    onCheckboxChanged(isSelected) {
        this.isSelected = isSelected;
        const event = {
            type: SetFilterListItem.EVENT_SELECTION_CHANGED,
            isSelected,
            item: this.item
        };
        this.dispatchEvent(event);
        this.refreshVariableAriaLabels();
    }
    toggleSelected() {
        if (!!this.params.readOnly) {
            return;
        }
        this.setSelected(!this.isSelected);
    }
    setSelected(isSelected, silent) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(this.isSelected, silent);
    }
    refreshVariableAriaLabels() {
        if (!this.isTree) {
            return;
        }
        const translate = this.localeService.getLocaleTextFunc();
        const checkboxValue = this.eCheckbox.getValue();
        const state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined);
        this.eCheckbox.setInputAriaLabel(`${visibilityLabel} (${state})`);
    }
    setupFixedAriaLabels(value) {
        if (!this.isTree) {
            return;
        }
        const translate = this.localeService.getLocaleTextFunc();
        const itemLabel = translate('ariaFilterValue', 'Filter Value');
        _.setAriaLabel(this.focusWrapper, `${value} ${itemLabel}`);
        _.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
    }
    refresh(item, isSelected, isExpanded) {
        var _a, _b;
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        if (this.valueFunction) {
            // underlying value might have changed, so call again and re-render
            const value = this.valueFunction();
            this.setTooltipAndCellRendererParams(value, value);
            if (!this.cellRendererComponent) {
                this.renderCellWithoutCellRenderer();
            }
        }
        (_b = (_a = this.cellRendererComponent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a, this.cellRendererParams);
    }
    render() {
        const { params: { column } } = this;
        let { value } = this;
        let formattedValue = null;
        if (typeof value === 'function') {
            this.valueFunction = value;
            formattedValue = this.valueFunction();
            // backwards compatibility for select all in value
            value = formattedValue;
        }
        else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = _.toStringOrNull(value);
        }
        else {
            formattedValue = this.getFormattedValue(column, value);
        }
        this.setTooltipAndCellRendererParams(value, formattedValue);
        this.renderCell();
    }
    setTooltipAndCellRendererParams(value, formattedValue) {
        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : _.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }
        this.cellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            colDef: this.params.colDef,
            column: this.params.column,
        };
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        if (this.isTree) {
            res.level = this.depth;
        }
        return res;
    }
    getFormattedValue(column, value) {
        return this.valueFormatterService.formatValue(column, null, value, this.valueFormatter, false);
    }
    renderCell() {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            this.renderCellWithoutCellRenderer();
            return;
        }
        cellRendererPromise.then(component => {
            if (component) {
                this.cellRendererComponent = component;
                this.eCheckbox.setLabel(component.getGui());
                this.addDestroyFunc(() => this.destroyBean(component));
            }
        });
    }
    renderCellWithoutCellRenderer() {
        var _a;
        let valueToRender = (_a = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted)) !== null && _a !== void 0 ? _a : this.translate('blanks');
        if (typeof valueToRender !== 'string') {
            _.doOnce(() => console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'), 'setFilterComplexObjectsValueFormatter');
            valueToRender = '';
        }
        this.eCheckbox.setLabel(valueToRender);
        this.setupFixedAriaLabels(valueToRender);
    }
    getComponentHolder() {
        return this.params.column.getColDef();
    }
}
SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
SetFilterListItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
SetFilterListItem.GROUP_TEMPLATE = `
        <div class="ag-set-filter-item" aria-hidden="true">
            <span class="ag-set-filter-group-icons">
                <span class="ag-set-filter-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-set-filter-group-opened-icon" ref="eGroupOpenedIcon"></span>
                <span class="ag-set-filter-group-indeterminate-icon" ref="eGroupIndeterminateIcon"></span>
            </span>
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;
SetFilterListItem.TEMPLATE = `
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;
__decorate$2([
    Autowired('valueFormatterService')
], SetFilterListItem.prototype, "valueFormatterService", void 0);
__decorate$2([
    Autowired('userComponentFactory')
], SetFilterListItem.prototype, "userComponentFactory", void 0);
__decorate$2([
    RefSelector('eCheckbox')
], SetFilterListItem.prototype, "eCheckbox", void 0);
__decorate$2([
    RefSelector('eGroupOpenedIcon')
], SetFilterListItem.prototype, "eGroupOpenedIcon", void 0);
__decorate$2([
    RefSelector('eGroupClosedIcon')
], SetFilterListItem.prototype, "eGroupClosedIcon", void 0);
__decorate$2([
    RefSelector('eGroupIndeterminateIcon')
], SetFilterListItem.prototype, "eGroupIndeterminateIcon", void 0);
__decorate$2([
    PostConstruct
], SetFilterListItem.prototype, "init", null);

const DEFAULT_LOCALE_TEXT = {
    loadingOoo: 'Loading...',
    blanks: '(Blanks)',
    searchOoo: 'Search...',
    selectAll: '(Select All)',
    selectAllSearchResults: '(Select All Search Results)',
    noMatches: 'No matches.'
};

class SetFilterModelFormatter {
    getModelAsString(model, setFilter) {
        const { values } = model || setFilter.getModel() || {};
        const valueModel = setFilter.getValueModel();
        if (values == null || valueModel == null) {
            return '';
        }
        const availableKeys = values.filter(v => valueModel.isKeyAvailable(v));
        const numValues = availableKeys.length;
        const formattedValues = availableKeys.slice(0, 10).map(key => setFilter.getFormattedValue(key));
        return `(${numValues}) ${formattedValues.join(',')}${numValues > 10 ? ',...' : ''}`;
    }
}

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** @param V type of value in the Set Filter */
class SetFilter extends ProvidedFilter {
    constructor() {
        super('setFilter');
        this.valueModel = null;
        this.setFilterParams = null;
        this.virtualList = null;
        this.caseSensitive = false;
        this.convertValuesToStrings = false;
        this.treeDataTreeList = false;
        this.groupingTreeList = false;
        this.hardRefreshVirtualList = false;
        this.noValueFormatterSupplied = false;
        // To make the filtering super fast, we store the keys in an Set rather than using the default array
        this.appliedModelKeys = null;
        this.noAppliedModelKeys = false;
        this.filterModelFormatter = new SetFilterModelFormatter();
    }
    postConstruct() {
        super.postConstruct();
    }
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    updateUiVisibility() { }
    createBodyTemplate() {
        return /* html */ `
            <div class="ag-set-filter">
                <div ref="eFilterLoading" class="ag-filter-loading ag-hidden">${this.translateForSetFilter('loadingOoo')}</div>
                <ag-input-text-field class="ag-mini-filter" ref="eMiniFilter"></ag-input-text-field>
                <div ref="eFilterNoMatches" class="ag-filter-no-matches ag-hidden">${this.translateForSetFilter('noMatches')}</div>
                <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`;
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        if (e.defaultPrevented) {
            return;
        }
        switch (e.key) {
            case KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
            case KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case KeyCode.RIGHT:
                this.handleKeyRight(e);
                break;
        }
    }
    handleKeySpace(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.toggleSelected();
    }
    handleKeyEnter(e) {
        if (!this.setFilterParams) {
            return;
        }
        const { excelMode, readOnly } = this.setFilterParams || {};
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
    }
    handleKeyLeft(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(false);
    }
    handleKeyRight(e) {
        var _a;
        (_a = this.getComponentForKeyEvent(e)) === null || _a === void 0 ? void 0 : _a.setExpanded(true);
    }
    getComponentForKeyEvent(e) {
        var _a;
        const eDocument = this.gridOptionsService.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) {
            return;
        }
        const currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) {
            return;
        }
        const component = this.virtualList.getComponentAt(currentItem);
        if (component == null) {
            return;
        }
        e.preventDefault();
        const { readOnly } = (_a = this.setFilterParams) !== null && _a !== void 0 ? _a : {};
        if (!!readOnly) {
            return;
        }
        return component;
    }
    getCssIdentifier() {
        return 'set-filter';
    }
    setModel(model) {
        var _a;
        if (model == null && ((_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.getModel()) == null) {
            // refreshing is expensive. if new and old model are both null (e.g. nothing set), skip.
            // mini filter isn't contained within the model, so always reset
            this.setMiniFilter(null);
            return AgPromise.resolve();
        }
        return super.setModel(model);
    }
    setModelAndRefresh(values) {
        return this.valueModel ? this.valueModel.setModel(values).then(() => this.refresh()) : AgPromise.resolve();
    }
    resetUiToDefaults() {
        this.setMiniFilter(null);
        return this.setModelAndRefresh(null);
    }
    setModelIntoUi(model) {
        this.setMiniFilter(null);
        const values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    }
    getModelFromUi() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        return { values, filterType: this.getFilterType() };
    }
    getFilterType() {
        return 'set';
    }
    getValueModel() {
        return this.valueModel;
    }
    areModelsEqual(a, b) {
        // both are missing
        if (a == null && b == null) {
            return true;
        }
        return a != null && b != null && _.areEqual(a.values, b.values);
    }
    setParams(params) {
        var _a;
        this.applyExcelModeOptions(params);
        super.setParams(params);
        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        let keyCreator = (_a = params.keyCreator) !== null && _a !== void 0 ? _a : params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        const isGroupCol = params.column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);
        this.valueModel = new SetValueModel({
            filterParams: params,
            setIsLoading: loading => this.setIsLoading(loading),
            valueFormatterService: this.valueFormatterService,
            translate: key => this.translateForSetFilter(key),
            caseFormat: v => this.caseFormat(v),
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
    }
    setValueFormatter(providedValueFormatter, keyCreator, convertValuesToStrings, treeList, isRefData) {
        let valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !convertValuesToStrings && !treeList) {
                throw new Error('AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator unless convertValuesToStrings is enabled');
            }
            this.noValueFormatterSupplied = true;
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = params => _.toStringOrNull(params.value);
            }
        }
        this.valueFormatter = valueFormatter;
    }
    generateCreateKey(keyCreator, convertValuesToStrings, treeDataOrGrouping) {
        if (treeDataOrGrouping && !keyCreator) {
            throw new Error('AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled.');
        }
        if (keyCreator) {
            return (value, node = null) => {
                const params = this.getKeyCreatorParams(value, node);
                return _.makeNull(keyCreator(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return value => Array.isArray(value) ? value : _.makeNull(_.toStringOrNull(value));
        }
        else {
            return value => _.makeNull(_.toStringOrNull(value));
        }
    }
    getFormattedValue(key) {
        var _a;
        let value = this.valueModel.getValue(key);
        if (this.noValueFormatterSupplied && (this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
            // essentially get back the cell value
            value = _.last(value);
        }
        const formattedValue = this.valueFormatterService.formatValue(this.setFilterParams.column, null, value, this.valueFormatter, false);
        return (_a = (formattedValue == null ? _.toStringOrNull(value) : formattedValue)) !== null && _a !== void 0 ? _a : this.translateForSetFilter('blanks');
    }
    applyExcelModeOptions(params) {
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
        if (params.excelMode && params.defaultToNothingSelected) {
            params.defaultToNothingSelected = false;
            _.doOnce(() => console.warn('AG Grid: The Set Filter Parameter "defaultToNothingSelected" value was ignored because it does not work when "excelMode" is used.'), 'setFilterExcelModeDefaultToNothingSelect');
        }
    }
    addEventListenersForDataChanges() {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, (event) => {
            // only interested in changes to do with this column
            if (this.setFilterParams && event.column === this.setFilterParams.column) {
                this.syncAfterDataChange();
            }
        });
    }
    syncAfterDataChange() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        let promise = this.valueModel.refreshValues();
        return promise.then(() => {
            this.refresh();
            this.onBtApply(false, true);
        });
    }
    setIsLoading(isLoading) {
        _.setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
    }
    initialiseFilterBodyUi() {
        this.initVirtualList();
        this.initMiniFilter();
    }
    initVirtualList() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const translate = this.localeService.getLocaleTextFunc();
        const filterListName = translate('ariaFilterList', 'Filter List');
        const isTree = !!this.setFilterParams.treeList;
        const virtualList = this.virtualList = this.createBean(new VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
        const eSetFilterList = this.getRefElement('eSetFilterList');
        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        const { cellHeight } = this.setFilterParams;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        const componentCreator = (item, listItemElement) => this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);
        const componentUpdater = (item, component) => this.updateSetListItem(item, component);
        virtualList.setComponentUpdater(componentUpdater);
        let model;
        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        }
        else {
            model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
        }
        if (isTree) {
            model = new TreeModelWrapper(model);
        }
        virtualList.setModel(model);
    }
    getSelectAllLabel() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';
        return this.translateForSetFilter(key);
    }
    createSetListItem(item, isTree, focusWrapper) {
        var _a, _b, _c, _d, _e, _f;
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const groupsExist = this.valueModel.hasGroups();
        let value;
        let depth;
        let isGroup;
        let hasIndeterminateExpandState;
        let selectedListener;
        let expandedListener;
        if (this.isSetFilterModelTreeItem(item)) {
            depth = item.depth;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                // select all
                value = () => this.getSelectAllLabel();
                isGroup = groupsExist;
                hasIndeterminateExpandState = true;
                selectedListener = (e) => this.onSelectAll(e.isSelected);
                expandedListener = (e) => this.onExpandAll(e.item, e.isExpanded);
            }
            else if (item.children) {
                // group
                value = (_c = (_b = (_a = this.setFilterParams).treeListFormatter) === null || _b === void 0 ? void 0 : _b.call(_a, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _c !== void 0 ? _c : item.treeKey;
                isGroup = true;
                selectedListener = (e) => this.onGroupItemSelected(e.item, e.isSelected);
                expandedListener = (e) => this.onExpandedChanged(e.item, e.isExpanded);
            }
            else {
                // leaf
                value = (_f = (_e = (_d = this.setFilterParams).treeListFormatter) === null || _e === void 0 ? void 0 : _e.call(_d, item.treeKey, item.depth, item.parentTreeKeys)) !== null && _f !== void 0 ? _f : item.treeKey;
                selectedListener = (e) => this.onItemSelected(e.item.key, e.isSelected);
            }
        }
        else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                value = () => this.getSelectAllLabel();
                selectedListener = (e) => this.onSelectAll(e.isSelected);
            }
            else {
                value = this.valueModel.getValue(item);
                selectedListener = (e) => this.onItemSelected(e.item, e.isSelected);
            }
        }
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        const itemParams = {
            focusWrapper,
            value,
            params: this.setFilterParams,
            translate: (translateKey) => this.translateForSetFilter(translateKey),
            valueFormatter: this.valueFormatter,
            item,
            isSelected,
            isTree,
            depth,
            groupsExist,
            isGroup,
            isExpanded,
            hasIndeterminateExpandState,
        };
        const listItem = this.createBean(new SetFilterListItem(itemParams));
        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
        }
        return listItem;
    }
    updateSetListItem(item, component) {
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        component.refresh(item, isSelected, isExpanded);
    }
    isSelectedExpanded(item) {
        let isSelected;
        let isExpanded;
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
        return { isSelected, isExpanded };
    }
    isSetFilterModelTreeItem(item) {
        return (item === null || item === void 0 ? void 0 : item.treeKey) !== undefined;
    }
    initMiniFilter() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const { eMiniFilter, localeService } = this;
        const translate = localeService.getLocaleTextFunc();
        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));
        this.addManagedListener(eMiniFilter.getInputElement(), 'keydown', e => this.onMiniFilterKeyDown(e));
    }
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    afterGuiAttached(params) {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        super.afterGuiAttached(params);
        // collapse all tree list items (if tree list)
        this.resetExpansion();
        this.refreshVirtualList();
        const { eMiniFilter } = this;
        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));
        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }
    }
    afterGuiDetached() {
        var _a, _b;
        super.afterGuiDetached();
        // discard any unapplied UI state (reset to model)
        if ((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.excelMode) {
            this.resetMiniFilter();
        }
        const appliedModel = this.getModel();
        if (((_b = this.setFilterParams) === null || _b === void 0 ? void 0 : _b.excelMode) || !this.areModelsEqual(appliedModel, this.getModelFromUi())) {
            this.resetUiToActiveModel(appliedModel);
            this.showOrHideResults();
        }
    }
    applyModel(source = 'api') {
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
        const result = super.applyModel(source);
        // keep appliedModelKeys in sync with the applied model
        const appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelKeys = new Set();
            appliedModel.values.forEach(key => {
                this.appliedModelKeys.add(this.caseFormat(key));
            });
        }
        else {
            this.appliedModelKeys = null;
        }
        this.noAppliedModelKeys = (appliedModel === null || appliedModel === void 0 ? void 0 : appliedModel.values.length) === 0;
        return result;
    }
    isModelValid(model) {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }
    doesFilterPass(params) {
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelKeys) {
            return true;
        }
        // if nothing selected, don't need to check value
        if (this.noAppliedModelKeys) {
            return false;
        }
        const { node, data } = params;
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, data);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, data);
        }
        let value = this.getValueFromNode(node, data);
        if (this.convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return this.doesFilterPassForConvertValuesToString(node, value);
        }
        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return value.some(v => this.isInAppliedModel(this.createKey(v, node)));
        }
        return this.isInAppliedModel(this.createKey(value, node));
    }
    doesFilterPassForConvertValuesToString(node, value) {
        const key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            if (key.length === 0) {
                return this.appliedModelKeys.has(null);
            }
            return key.some(v => this.isInAppliedModel(v));
        }
        return this.isInAppliedModel(key);
    }
    doesFilterPassForTreeData(node, data) {
        var _a;
        if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath(data))));
    }
    doesFilterPassForGrouping(node, data) {
        const dataPath = this.columnModel.getRowGroupColumns().map(groupCol => this.valueService.getKeyForNode(groupCol, node));
        dataPath.push(this.getValueFromNode(node, data));
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath)));
    }
    checkMakeNullDataPath(dataPath) {
        if (dataPath) {
            dataPath = dataPath.map(treeKey => _.toStringOrNull(_.makeNull(treeKey)));
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(treeKey => treeKey == null)) {
            return null;
        }
        return dataPath;
    }
    isInAppliedModel(key) {
        return this.appliedModelKeys.has(this.caseFormat(key));
    }
    getValueFromNode(node, data) {
        const { valueGetter, api, colDef, column, columnApi, context } = this.setFilterParams;
        return valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: data,
            getValue: (field) => data[field],
            node: node,
        });
    }
    getKeyCreatorParams(value, node = null) {
        return {
            value,
            colDef: this.setFilterParams.colDef,
            column: this.setFilterParams.column,
            node: node,
            data: node === null || node === void 0 ? void 0 : node.data,
            api: this.setFilterParams.api,
            columnApi: this.setFilterParams.columnApi,
            context: this.setFilterParams.context
        };
    }
    onNewRowsLoaded() {
        if (!this.isValuesTakenFromGrid()) {
            return;
        }
        this.syncAfterDataChange();
    }
    isValuesTakenFromGrid() {
        if (!this.valueModel) {
            return false;
        }
        const valuesType = this.valueModel.getValuesType();
        return valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param values The values to use.
     */
    setFilterValues(values) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.overrideValues(values).then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    resetFilterValues() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange();
    }
    refreshFilterValues() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        // the model is still being initialised
        if (!this.valueModel.isInitialised()) {
            return;
        }
        this.valueModel.refreshValues().then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }
    onAnyFilterChanged() {
        // don't block the current action when updating the values for this filter
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            if (!this.valueModel) {
                throw new Error('Value model has not been created.');
            }
            this.valueModel.refreshAfterAnyFilterChanged().then(refresh => {
                if (refresh) {
                    this.refresh();
                    this.showOrHideResults();
                }
            });
        }, 0);
    }
    onMiniFilterInput() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            return;
        }
        const { applyMiniFilterWhileTyping, readOnly } = this.setFilterParams || {};
        if (!readOnly && applyMiniFilterWhileTyping) {
            this.filterOnAllVisibleValues(false);
        }
        else {
            this.updateUiAfterMiniFilterChange();
        }
    }
    updateUiAfterMiniFilterChange() {
        if (!this.setFilterParams) {
            throw new Error('Set filter params have not been provided.');
        }
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const { excelMode, readOnly } = this.setFilterParams || {};
        if (excelMode == null || !!readOnly) {
            this.refresh();
        }
        else if (this.valueModel.getMiniFilter() == null) {
            this.resetUiToActiveModel(this.getModel());
        }
        else {
            this.valueModel.selectAllMatchingMiniFilter(true);
            this.refresh();
            this.onUiChanged();
        }
        this.showOrHideResults();
    }
    showOrHideResults() {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        const hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
        _.setDisplayed(this.eNoMatches, hideResults);
        _.setDisplayed(this.eSetFilterList, !hideResults);
    }
    resetMiniFilter() {
        var _a;
        this.eMiniFilter.setValue(null, true);
        (_a = this.valueModel) === null || _a === void 0 ? void 0 : _a.setMiniFilter(null);
    }
    resetUiToActiveModel(currentModel, afterUiUpdatedFunc) {
        // override the default behaviour as we don't always want to clear the mini filter
        this.setModelAndRefresh(currentModel == null ? null : currentModel.values).then(() => {
            this.onUiChanged(false, 'prevent');
            afterUiUpdatedFunc === null || afterUiUpdatedFunc === void 0 ? void 0 : afterUiUpdatedFunc();
        });
    }
    handleCancelEnd(e) {
        this.setMiniFilter(null);
        super.handleCancelEnd(e);
    }
    onMiniFilterKeyDown(e) {
        const { excelMode, readOnly } = this.setFilterParams || {};
        if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
            this.filterOnAllVisibleValues();
        }
    }
    filterOnAllVisibleValues(applyImmediately = true) {
        const { readOnly } = this.setFilterParams || {};
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
    }
    focusRowIfAlive(rowIndex) {
        if (rowIndex == null) {
            return;
        }
        window.setTimeout(() => {
            if (!this.virtualList) {
                throw new Error('Virtual list has not been created.');
            }
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }
    onSelectAll(isSelected) {
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
    }
    onGroupItemSelected(item, isSelected) {
        const recursiveGroupSelection = (i) => {
            if (i.children) {
                i.children.forEach(childItem => recursiveGroupSelection(childItem));
            }
            else {
                this.selectItem(i.key, isSelected);
            }
        };
        recursiveGroupSelection(item);
        this.refreshAfterSelection();
    }
    onItemSelected(key, isSelected) {
        if (!this.valueModel) {
            throw new Error('Value model has not been created.');
        }
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.selectItem(key, isSelected);
        this.refreshAfterSelection();
    }
    selectItem(key, isSelected) {
        if (isSelected) {
            this.valueModel.selectKey(key);
        }
        else {
            this.valueModel.deselectKey(key);
        }
    }
    onExpandAll(item, isExpanded) {
        const recursiveExpansion = (i) => {
            if (i.filterPasses && i.available && i.children) {
                i.children.forEach(childItem => recursiveExpansion(childItem));
                i.expanded = isExpanded;
            }
        };
        recursiveExpansion(item);
        this.refreshAfterExpansion();
    }
    onExpandedChanged(item, isExpanded) {
        item.expanded = isExpanded;
        this.refreshAfterExpansion();
    }
    refreshAfterExpansion() {
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.valueModel.updateDisplayedValues('expansion');
        this.refresh();
        this.focusRowIfAlive(focusedRow);
    }
    refreshAfterSelection() {
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }
    setMiniFilter(newMiniFilter) {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    }
    getMiniFilter() {
        return this.valueModel ? this.valueModel.getMiniFilter() : null;
    }
    refresh() {
        if (!this.virtualList) {
            throw new Error('Virtual list has not been created.');
        }
        this.virtualList.refresh(!this.hardRefreshVirtualList);
        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    }
    getFilterKeys() {
        return this.valueModel ? this.valueModel.getKeys() : [];
    }
    getFilterValues() {
        return this.valueModel ? this.valueModel.getValues() : [];
    }
    getValues() {
        return this.getFilterKeys();
    }
    refreshVirtualList() {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.refresh();
        }
    }
    translateForSetFilter(key) {
        const translate = this.localeService.getLocaleTextFunc();
        return translate(key, DEFAULT_LOCALE_TEXT[key]);
    }
    isSelectAllSelected() {
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
    }
    areAllChildrenSelected(item) {
        const recursiveChildSelectionCheck = (i) => {
            if (i.children) {
                let someTrue = false;
                let someFalse = false;
                const mixed = i.children.some(child => {
                    if (!child.filterPasses || !child.available) {
                        return false;
                    }
                    const childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        return true;
                    }
                    if (childSelected) {
                        someTrue = true;
                    }
                    else {
                        someFalse = true;
                    }
                    return someTrue && someFalse;
                });
                // returning `undefined` means the checkbox status is indeterminate.
                // if not mixed and some true, all must be true
                return mixed ? undefined : someTrue;
            }
            else {
                return this.valueModel.isKeySelected(i.key);
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
    }
    destroy() {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }
        super.destroy();
    }
    caseFormat(valueToFormat) {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase();
    }
    resetExpansion() {
        var _a, _b;
        if (!((_a = this.setFilterParams) === null || _a === void 0 ? void 0 : _a.treeList)) {
            return;
        }
        const selectAllItem = (_b = this.valueModel) === null || _b === void 0 ? void 0 : _b.getSelectAllItem();
        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            const recursiveCollapse = (i) => {
                if (i.children) {
                    i.children.forEach(childItem => recursiveCollapse(childItem));
                    i.expanded = false;
                }
            };
            recursiveCollapse(selectAllItem);
            this.valueModel.updateDisplayedValues('expansion');
        }
    }
    getModelAsString(model) {
        return this.filterModelFormatter.getModelAsString(model, this);
    }
    getPositionableElement() {
        return this.eSetFilterList;
    }
}
__decorate$1([
    RefSelector('eMiniFilter')
], SetFilter.prototype, "eMiniFilter", void 0);
__decorate$1([
    RefSelector('eFilterLoading')
], SetFilter.prototype, "eFilterLoading", void 0);
__decorate$1([
    RefSelector('eSetFilterList')
], SetFilter.prototype, "eSetFilterList", void 0);
__decorate$1([
    RefSelector('eFilterNoMatches')
], SetFilter.prototype, "eNoMatches", void 0);
__decorate$1([
    Autowired('valueFormatterService')
], SetFilter.prototype, "valueFormatterService", void 0);
__decorate$1([
    Autowired('columnModel')
], SetFilter.prototype, "columnModel", void 0);
__decorate$1([
    Autowired('valueService')
], SetFilter.prototype, "valueService", void 0);
class ModelWrapper {
    constructor(model) {
        this.model = model;
    }
    getRowCount() {
        return this.model.getDisplayedValueCount();
    }
    getRow(index) {
        return this.model.getDisplayedItem(index);
    }
    isRowSelected(index) {
        return this.model.isKeySelected(this.getRow(index));
    }
    areRowsEqual(oldRow, newRow) {
        return oldRow === newRow;
    }
}
class ModelWrapperWithSelectAll {
    constructor(model, isSelectAllSelected) {
        this.model = model;
        this.isSelectAllSelected = isSelectAllSelected;
    }
    getRowCount() {
        return this.model.getDisplayedValueCount() + 1;
    }
    getRow(index) {
        return index === 0 ? this.model.getSelectAllItem() : this.model.getDisplayedItem(index - 1);
    }
    isRowSelected(index) {
        return index === 0 ? this.isSelectAllSelected() : this.model.isKeySelected(this.getRow(index));
    }
    areRowsEqual(oldRow, newRow) {
        return oldRow === newRow;
    }
}
// isRowSelected is used by VirtualList to add aria tags for flat lists. We want to suppress this when using trees
class TreeModelWrapper {
    constructor(model) {
        this.model = model;
    }
    getRowCount() {
        return this.model.getRowCount();
    }
    getRow(index) {
        return this.model.getRow(index);
    }
    areRowsEqual(oldRow, newRow) {
        if (oldRow == null && newRow == null) {
            return true;
        }
        return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
    }
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SetFloatingFilterComp extends Component {
    constructor() {
        super(/* html */ `
            <div class="ag-floating-filter-input ag-set-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`);
        this.availableValuesListenerAdded = false;
        this.filterModelFormatter = new SetFilterModelFormatter();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
            .addGuiEventListener('click', () => params.showParentFilter());
        this.params = params;
    }
    onParentModelChanged(parentModel) {
        this.updateFloatingFilterText(parentModel);
    }
    parentSetFilterInstance(cb) {
        this.params.parentFilterInstance((filter) => {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as its parent');
            }
            cb(filter);
        });
    }
    addAvailableValuesListener() {
        this.parentSetFilterInstance((setFilter) => {
            const setValueModel = setFilter.getValueModel();
            if (!setValueModel) {
                return;
            }
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            this.addManagedListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, () => this.updateFloatingFilterText());
        });
        this.availableValuesListenerAdded = true;
    }
    updateFloatingFilterText(parentModel) {
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }
        this.parentSetFilterInstance((setFilter) => {
            this.eFloatingFilterText.setValue(this.filterModelFormatter.getModelAsString(parentModel, setFilter));
        });
    }
}
__decorate([
    RefSelector('eFloatingFilterText')
], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
__decorate([
    Autowired('columnModel')
], SetFloatingFilterComp.prototype, "columnModel", void 0);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.1';

const SetFilterModule = {
    version: VERSION,
    moduleName: ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: SetFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: SetFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { SetFilter, SetFilterModule };
