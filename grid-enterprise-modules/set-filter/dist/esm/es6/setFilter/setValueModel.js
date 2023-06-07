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
export class SetValueModel {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0VmFsdWVNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZXRGaWx0ZXIvc2V0VmFsdWVNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBSUgsU0FBUyxFQUlULFVBQVUsRUFJVixZQUFZLEVBRVosQ0FBQyxFQU1KLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFdEUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFdEUsTUFBTSxDQUFOLElBQVksd0JBRVg7QUFGRCxXQUFZLHdCQUF3QjtJQUNoQyx5RkFBYSxDQUFBO0lBQUUsaUdBQWlCLENBQUE7SUFBRSwyR0FBc0IsQ0FBQTtBQUM1RCxDQUFDLEVBRlcsd0JBQXdCLEtBQXhCLHdCQUF3QixRQUVuQztBQWtCRCwrQ0FBK0M7QUFDL0MsTUFBTSxPQUFPLGFBQWE7SUF5Q3RCLFlBQVksTUFBOEI7O1FBdEN6QixzQkFBaUIsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBbUJoRCxtQkFBYyxHQUFrQixJQUFJLENBQUM7UUFFN0MsNkNBQTZDO1FBQ3JDLG1CQUFjLEdBQW1DLElBQUksQ0FBQztRQUs5RCw4REFBOEQ7UUFDdEQsY0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVELHdFQUF3RTtRQUNoRSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBRWpELG9EQUFvRDtRQUM1QyxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBRXhDLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBR2pDLE1BQU0sRUFDRixtQkFBbUIsRUFDbkIsV0FBVyxFQUNYLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLFlBQVks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