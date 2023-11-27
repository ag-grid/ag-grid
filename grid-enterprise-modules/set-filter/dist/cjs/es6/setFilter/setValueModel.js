"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetValueModel = exports.SetFilterModelValuesType = void 0;
const core_1 = require("@ag-grid-community/core");
const clientSideValueExtractor_1 = require("../clientSideValueExtractor");
const flatSetDisplayValueModel_1 = require("./flatSetDisplayValueModel");
const treeSetDisplayValueModel_1 = require("./treeSetDisplayValueModel");
const filteringKeys_1 = require("./filteringKeys");
var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType = exports.SetFilterModelValuesType || (exports.SetFilterModelValuesType = {}));
/** @param V type of value in the Set Filter */
class SetValueModel {
    constructor(params) {
        var _a;
        this.localEventService = new core_1.EventService();
        this.miniFilterText = null;
        /** When true, in excelMode = 'windows', it adds previously selected filter items to newly checked filter selection */
        this.addCurrentSelectionToFilter = false;
        /** Values provided to the filter for use. */
        this.providedValues = null;
        /** All possible values for the filter, sorted if required. */
        this.allValues = new Map();
        /** Remaining keys when filters from other columns have been applied. */
        this.availableKeys = new Set();
        /** Keys that have been selected for this filter. */
        this.selectedKeys = new Set();
        this.initialised = false;
        const { usingComplexObjects, columnModel, valueService, treeDataTreeList, groupingTreeList, filterParams, gridOptionsService, valueFormatterService, valueFormatter, addManagedListener } = params;
        const { column, colDef, textFormatter, doesRowPassOtherFilter, suppressSorting, comparator, rowModel, values, caseSensitive, convertValuesToStrings, treeList, treeListPathGetter, treeListFormatter } = filterParams;
        this.filterParams = filterParams;
        this.gridOptionsService = gridOptionsService;
        this.setIsLoading = params.setIsLoading;
        this.translate = params.translate;
        this.caseFormat = params.caseFormat;
        this.createKey = params.createKey;
        this.usingComplexObjects = !!params.usingComplexObjects;
        this.formatter = textFormatter || core_1.TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.convertValuesToStrings = !!convertValuesToStrings;
        this.filteringKeys = new filteringKeys_1.SetValueModelFilteringKeys({ caseFormat: this.caseFormat });
        const keyComparator = comparator !== null && comparator !== void 0 ? comparator : colDef.comparator;
        const treeDataOrGrouping = !!treeDataTreeList || !!groupingTreeList;
        // If using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys.
        // Also if tree data, grouping, or date with tree list, then need to do value sort
        this.compareByValue = !!((usingComplexObjects && keyComparator) || treeDataOrGrouping || (treeList && !treeListPathGetter));
        if (treeDataOrGrouping && !keyComparator) {
            this.entryComparator = this.createTreeDataOrGroupingComparator();
        }
        else if (treeList && !treeListPathGetter && !keyComparator) {
            this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => core_1._.defaultComparator(aValue, bValue);
        }
        else {
            this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => keyComparator(aValue, bValue);
        }
        this.keyComparator = (_a = keyComparator) !== null && _a !== void 0 ? _a : core_1._.defaultComparator;
        this.caseSensitive = !!caseSensitive;
        const getDataPath = gridOptionsService.get('getDataPath');
        const groupAllowUnbalanced = gridOptionsService.get('groupAllowUnbalanced');
        if (rowModel.getType() === 'clientSide') {
            this.clientSideValuesExtractor = new clientSideValueExtractor_1.ClientSideValuesExtractor(rowModel, this.filterParams, this.createKey, this.caseFormat, columnModel, valueService, treeDataOrGrouping, !!treeDataTreeList, getDataPath, groupAllowUnbalanced, addManagedListener);
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
        this.displayValueModel = treeList ? new treeSetDisplayValueModel_1.TreeSetDisplayValueModel(this.formatter, treeListPathGetter, treeListFormatter, treeDataTreeList || groupingTreeList) : new flatSetDisplayValueModel_1.FlatSetDisplayValueModel(valueFormatterService, valueFormatter, this.formatter, column);
        this.updateAllValues().then(updatedKeys => this.resetSelectionState(updatedKeys || []));
    }
    addEventListener(eventType, listener, async) {
        this.localEventService.addEventListener(eventType, listener, async);
    }
    removeEventListener(eventType, listener, async) {
        this.localEventService.removeEventListener(eventType, listener, async);
    }
    updateOnParamsChange(filterParams) {
        return new core_1.AgPromise(resolve => {
            const { values, textFormatter, suppressSorting, } = filterParams;
            const currentProvidedValues = this.providedValues;
            const currentSuppressSorting = this.suppressSorting;
            this.filterParams = filterParams;
            this.formatter = textFormatter || core_1.TextFilter.DEFAULT_FORMATTER;
            this.suppressSorting = suppressSorting || false;
            this.providedValues = values !== null && values !== void 0 ? values : null;
            // Rebuild values when values or their sort order changes
            if (this.providedValues !== currentProvidedValues || this.suppressSorting !== currentSuppressSorting) {
                if (!values || values.length === 0) {
                    this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
                    this.providedValues = null;
                }
                else {
                    const isArrayOfCallback = Array.isArray(values) && values.length > 0 && typeof values[0] === 'function';
                    this.valuesType = isArrayOfCallback ?
                        SetFilterModelValuesType.PROVIDED_CALLBACK :
                        SetFilterModelValuesType.PROVIDED_LIST;
                }
                const currentModel = this.getModel();
                this.updateAllValues().then((updatedKeys) => {
                    this.setModel(currentModel).then(() => resolve());
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    refreshValues() {
        return new core_1.AgPromise(resolve => {
            // don't get the model until values are resolved, as there could be queued setModel calls
            this.allValuesPromise.then(() => {
                const currentModel = this.getModel();
                this.updateAllValues();
                // ensure model is updated for new values
                this.setModel(currentModel).then(() => resolve());
            });
        });
    }
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    overrideValues(valuesToUse) {
        return new core_1.AgPromise(resolve => {
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
        return core_1.AgPromise.resolve(false);
    }
    isInitialised() {
        return this.initialised;
    }
    updateAllValues() {
        this.allValuesPromise = new core_1.AgPromise(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                    this.getValuesFromRowsAsync(false).then(values => resolve(this.processAllValues(values)));
                    break;
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(this.processAllValues(this.uniqueValues(this.validateProvidedValues(this.providedValues))));
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);
                    const callback = this.providedValues;
                    const { columnApi, api, column, colDef } = this.filterParams;
                    const { context } = this.gridOptionsService;
                    const params = {
                        success: values => {
                            this.setIsLoading(false);
                            resolve(this.processAllValues(this.uniqueValues(this.validateProvidedValues(values))));
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
    processAllValues(values) {
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
                    core_1._.warnOnce('Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types');
                }
                else {
                    core_1._.warnOnce('Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects or enable convertValuesToStrings?');
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
    getParamsForValuesFromRows(removeUnavailableValues = false) {
        if (!this.clientSideValuesExtractor) {
            core_1._.doOnce(() => {
                console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            }, 'setFilterValueNotCSRM');
            return null;
        }
        const predicate = (node) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));
        const existingValues = removeUnavailableValues && !this.caseSensitive ? this.allValues : undefined;
        return { predicate, existingValues };
    }
    getValuesFromRows(removeUnavailableValues = false) {
        const params = this.getParamsForValuesFromRows(removeUnavailableValues);
        if (!params) {
            return null;
        }
        return this.clientSideValuesExtractor.extractUniqueValues(params.predicate, params.existingValues);
    }
    getValuesFromRowsAsync(removeUnavailableValues = false) {
        const params = this.getParamsForValuesFromRows(removeUnavailableValues);
        if (!params) {
            return core_1.AgPromise.resolve(null);
        }
        return this.clientSideValuesExtractor.extractUniqueValuesAsync(params.predicate, params.existingValues);
    }
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value) {
        value = core_1._.makeNull(value);
        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }
        if (value === null) {
            // Reset 'Add current selection to filter' checkbox when clearing mini filter
            this.setAddCurrentSelectionToFilter(false);
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
    getAddSelectionToFilterItem() {
        return this.displayValueModel.getAddSelectionToFilterItem();
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
    setAddCurrentSelectionToFilter(value) {
        this.addCurrentSelectionToFilter = value;
    }
    isInWindowsExcelMode() {
        return this.filterParams.excelMode === 'windows';
    }
    isAddCurrentSelectionToFilterChecked() {
        return this.isInWindowsExcelMode() && this.addCurrentSelectionToFilter;
    }
    showAddCurrentSelectionToFilter() {
        // We only show the 'Add current selection to filter' option
        // when excel mode is enabled with 'windows' mode
        // and when the users types a value in the mini filter.
        return (this.isInWindowsExcelMode()
            && core_1._.exists(this.miniFilterText)
            && this.miniFilterText.length > 0);
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
        if (!this.hasSelections()) {
            return null;
        }
        // When excelMode = 'windows' and the user has ticked 'Add current selection to filter'
        // the filtering keys can be different from the selected keys, and they should be included
        // in the model.
        const filteringKeys = this.isAddCurrentSelectionToFilterChecked()
            ? this.filteringKeys.allFilteringKeys()
            : null;
        if (filteringKeys && filteringKeys.size > 0) {
            if (this.selectedKeys) {
                // When existing filtering keys are present along with selected keys,
                // we combine them and return the result.
                // We use a set structure to avoid duplicates
                const modelKeys = new Set([
                    ...Array.from(filteringKeys),
                    ...Array.from(this.selectedKeys).filter(key => !filteringKeys.has(key)),
                ]);
                return Array.from(modelKeys);
            }
            return Array.from(filteringKeys);
        }
        // No extra filtering keys are present - so just return the selected keys
        return Array.from(this.selectedKeys);
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
                    const formattedKey = this.caseFormat(core_1._.makeNull(unformattedKey));
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
            const valueToUse = core_1._.makeNull(value);
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
                const diff = core_1._.defaultComparator(aValue[i], bValue[i]);
                if (diff !== 0) {
                    return diff;
                }
            }
            return 0;
        };
    }
    setAppliedModelKeys(appliedModelKeys) {
        this.filteringKeys.setFilteringKeys(appliedModelKeys);
    }
    addToAppliedModelKeys(appliedModelKey) {
        this.filteringKeys.addFilteringKey(appliedModelKey);
    }
    getAppliedModelKeys() {
        return this.filteringKeys.allFilteringKeys();
    }
    getCaseFormattedAppliedModelKeys() {
        return this.filteringKeys.allFilteringKeysCaseFormatted();
    }
    hasAppliedModelKey(appliedModelKey) {
        return this.filteringKeys.hasCaseFormattedFilteringKey(appliedModelKey);
    }
    hasAnyAppliedModelKey() {
        return !this.filteringKeys.noAppliedFilteringKeys();
    }
}
exports.SetValueModel = SetValueModel;
SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';
