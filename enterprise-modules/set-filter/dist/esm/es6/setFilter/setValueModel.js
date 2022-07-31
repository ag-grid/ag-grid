import { Constants, AgPromise, TextFilter, EventService, _ } from '@ag-grid-community/core';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
export var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType || (SetFilterModelValuesType = {}));
const NULL_SUBSTITUTE = '__<ag-grid-pseudo-null>__';
export class SetValueModel {
    constructor(filterParams, setIsLoading, valueFormatterService, translate, caseFormat) {
        this.filterParams = filterParams;
        this.setIsLoading = setIsLoading;
        this.valueFormatterService = valueFormatterService;
        this.translate = translate;
        this.caseFormat = caseFormat;
        this.localEventService = new EventService();
        this.miniFilterText = null;
        // The lookup for a set is much faster than the lookup for an array, especially when the length of the array is
        // thousands of records long, so where lookups are important we use a set.
        /** Values provided to the filter for use. */
        this.providedValues = null;
        /** All possible values for the filter, sorted if required. */
        this.allValues = [];
        /** Remaining values when filters from other columns have been applied. */
        this.availableValues = new Set();
        /** All values that are currently displayed, after the mini-filter has been applied. */
        this.displayedValues = [];
        /** Values that have been selected for this filter. */
        this.selectedValues = new Set();
        this.initialised = false;
        const { column, colDef, textFormatter, doesRowPassOtherFilter, suppressSorting, comparator, rowModel, values, caseSensitive } = filterParams;
        this.column = column;
        this.formatter = textFormatter || TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.comparator = comparator || colDef.comparator || _.defaultComparator;
        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(rowModel, this.filterParams, this.caseFormat);
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
        this.updateAllValues().then(updatedValues => this.resetSelectionState(updatedValues || []));
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
    refreshAfterAnyFilterChanged() {
        return this.showAvailableOnly() ?
            this.allValuesPromise.then(values => this.updateAvailableValues(values || [])) :
            AgPromise.resolve();
    }
    isInitialised() {
        return this.initialised;
    }
    updateAllValues() {
        this.allValuesPromise = new AgPromise(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    const values = this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES ?
                        this.getValuesFromRows(false) : this.uniqueUnsortedStringArray(this.providedValues);
                    const sortedValues = this.sortValues(values || []);
                    this.allValues = sortedValues;
                    resolve(sortedValues);
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);
                    const callback = this.providedValues;
                    const { columnApi, api, context, column, colDef } = this.filterParams;
                    const params = {
                        success: values => {
                            const processedValues = this.uniqueUnsortedStringArray(values || []);
                            this.setIsLoading(false);
                            const sortedValues = this.sortValues(processedValues || []);
                            this.allValues = sortedValues;
                            resolve(sortedValues);
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
        this.allValuesPromise.then(values => this.updateAvailableValues(values || [])).then(() => this.initialised = true);
        return this.allValuesPromise;
    }
    setValuesType(value) {
        this.valuesType = value;
    }
    getValuesType() {
        return this.valuesType;
    }
    isValueAvailable(value) {
        return this.availableValues.has(value);
    }
    showAvailableOnly() {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }
    updateAvailableValues(allValues) {
        const availableValues = this.showAvailableOnly() ? this.sortValues(this.getValuesFromRows(true)) : allValues;
        this.availableValues = _.convertToSet(availableValues);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
        this.updateDisplayedValues();
    }
    sortValues(values) {
        if (this.suppressSorting) {
            return values;
        }
        if (!this.filterParams.excelMode || values.indexOf(null) < 0) {
            return values.sort(this.comparator);
        }
        // ensure the blank value always appears last
        return values.filter(v => v != null).sort(this.comparator).concat(null);
    }
    getValuesFromRows(removeUnavailableValues = false) {
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }
        const predicate = (node) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));
        return this.clientSideValuesExtractor.extractUniqueValues(predicate);
    }
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value) {
        value = _.makeNull(value);
        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilterText = value;
        this.updateDisplayedValues();
        return true;
    }
    getMiniFilter() {
        return this.miniFilterText;
    }
    updateDisplayedValues() {
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayedValues = _.values(this.availableValues);
            return;
        }
        // if filter present, we filter down the list
        this.displayedValues = [];
        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');
        const matchesFilter = (valueToCheck) => valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;
        this.availableValues.forEach(value => {
            if (value == null) {
                if (this.filterParams.excelMode && matchesFilter(this.translate('blanks'))) {
                    this.displayedValues.push(value);
                }
            }
            else {
                const textFormatterValue = this.formatter(value);
                // TODO: should this be applying the text formatter *after* the value formatter?
                const valueFormatterValue = this.valueFormatterService.formatValue(this.column, null, textFormatterValue, this.filterParams.valueFormatter, false);
                if (matchesFilter(textFormatterValue) || matchesFilter(valueFormatterValue)) {
                    this.displayedValues.push(value);
                }
            }
        });
    }
    getDisplayedValueCount() {
        return this.displayedValues.length;
    }
    getDisplayedValue(index) {
        return this.displayedValues[index];
    }
    hasSelections() {
        return this.filterParams.defaultToNothingSelected ?
            this.selectedValues.size > 0 :
            this.allValues.length !== this.selectedValues.size;
    }
    getValues() {
        return this.allValues.slice();
    }
    selectAllMatchingMiniFilter(clearExistingSelection = false) {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedValues = _.convertToSet(this.allValues);
        }
        else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedValues.clear();
            }
            this.displayedValues.forEach(value => this.selectedValues.add(value));
        }
    }
    deselectAllMatchingMiniFilter() {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedValues.clear();
        }
        else {
            // ensure everything that matches the mini filter is deselected
            this.displayedValues.forEach(value => this.selectedValues.delete(value));
        }
    }
    selectValue(value) {
        this.selectedValues.add(value);
    }
    deselectValue(value) {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayedValues);
        }
        this.selectedValues.delete(value);
    }
    isValueSelected(value) {
        return this.selectedValues.has(value);
    }
    isEverythingVisibleSelected() {
        return this.displayedValues.filter(it => this.isValueSelected(it)).length === this.displayedValues.length;
    }
    isNothingVisibleSelected() {
        return this.displayedValues.filter(it => this.isValueSelected(it)).length === 0;
    }
    getModel() {
        return this.hasSelections() ? _.values(this.selectedValues) : null;
    }
    setModel(model) {
        return this.allValuesPromise.then(values => {
            if (model == null) {
                this.resetSelectionState(values || []);
            }
            else {
                // select all values from the model that exist in the filter
                this.selectedValues.clear();
                const allValues = this.uniqueValues(values || []);
                model.forEach(value => {
                    const allValue = allValues[this.uniqueKey(value)];
                    if (allValue !== undefined) {
                        this.selectedValues.add(allValue);
                    }
                });
            }
        });
    }
    uniqueUnsortedStringArray(values) {
        const stringifiedResults = _.toStrings(values);
        if (!stringifiedResults) {
            return [];
        }
        const uniqueValues = this.uniqueValues(stringifiedResults);
        /*
        * It is not possible to simply use Object.values(uniqueValues) here as the keys inside uniqueValues could be numeric.
        * Javascript objects sort numeric keys and do not fully respect the insert order, as such to trust the results are unsorted
        * we need to reference the order of the original array as done here.
        */
        return stringifiedResults.map(_.makeNull).filter(value => {
            const key = this.uniqueKey(value);
            if (key in uniqueValues) {
                delete uniqueValues[key];
                return true;
            }
            return false;
        });
    }
    uniqueValues(values) {
        // Honour case-sensitivity setting for matching purposes here, preserving original casing
        // in the selectedValues output.
        const uniqueValues = {};
        (values || []).forEach(rawValue => {
            const value = _.makeNull(rawValue);
            const key = this.uniqueKey(value);
            if (uniqueValues[key] === undefined) {
                uniqueValues[key] = value;
            }
        });
        return uniqueValues;
    }
    uniqueKey(v) {
        return v == null ? NULL_SUBSTITUTE : this.caseFormat(v);
    }
    resetSelectionState(values) {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedValues.clear();
        }
        else {
            this.selectedValues = _.convertToSet(values || []);
        }
    }
}
SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';
