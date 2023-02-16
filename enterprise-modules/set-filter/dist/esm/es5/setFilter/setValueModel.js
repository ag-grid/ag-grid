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
import { AgPromise, TextFilter, EventService, _ } from '@ag-grid-community/core';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { FlatSetDisplayValueModel } from './flatSetDisplayValueModel';
import { TreeSetDisplayValueModel } from './treeSetDisplayValueModel';
export var SetFilterModelValuesType;
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
        var usingComplexObjects = params.usingComplexObjects, columnModel = params.columnModel, valueService = params.valueService, treeDataTreeList = params.treeDataTreeList, groupingTreeList = params.groupingTreeList, filterParams = params.filterParams, gridOptionsService = params.gridOptionsService, valueFormatterService = params.valueFormatterService, valueFormatter = params.valueFormatter;
        var column = filterParams.column, colDef = filterParams.colDef, textFormatter = filterParams.textFormatter, doesRowPassOtherFilter = filterParams.doesRowPassOtherFilter, suppressSorting = filterParams.suppressSorting, comparator = filterParams.comparator, rowModel = filterParams.rowModel, values = filterParams.values, caseSensitive = filterParams.caseSensitive, convertValuesToStrings = filterParams.convertValuesToStrings, treeList = filterParams.treeList, treeListPathGetter = filterParams.treeListPathGetter, treeListFormatter = filterParams.treeListFormatter;
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
                var _c = __read(_a, 2), _aKey = _c[0], aValue = _c[1];
                var _d = __read(_b, 2), _bKey = _d[0], bValue = _d[1];
                return _.defaultComparator(aValue, bValue);
            };
        }
        else {
            this.entryComparator = function (_a, _b) {
                var _c = __read(_a, 2), _aKey = _c[0], aValue = _c[1];
                var _d = __read(_b, 2), _bKey = _d[0], bValue = _d[1];
                return keyComparator(aValue, bValue);
            };
        }
        this.keyComparator = (_a = keyComparator) !== null && _a !== void 0 ? _a : _.defaultComparator;
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
        return new AgPromise(function (resolve) {
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
        return AgPromise.resolve(false);
    };
    SetValueModel.prototype.isInitialised = function () {
        return this.initialised;
    };
    SetValueModel.prototype.updateAllValues = function () {
        var _this = this;
        this.allValuesPromise = new AgPromise(function (resolve) {
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
                    _.doOnce(function () { return console.warn('Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'); }, 'setFilterComplexObjectsProvidedNull');
                }
                else {
                    _.doOnce(function () { return console.warn('AG Grid: Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects or enable convertValuesToStrings?'); }, 'setFilterComplexObjectsProvidedPrimitive');
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
        value = _.makeNull(value);
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
            var valueToUse = _.makeNull(value);
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
            var _c = __read(_a, 2), _aKey = _c[0], aValue = _c[1];
            var _d = __read(_b, 2), _bKey = _d[0], bValue = _d[1];
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
                var diff = _.defaultComparator(aValue[i], bValue[i]);
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
export { SetValueModel };
