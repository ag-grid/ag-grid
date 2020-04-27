import { Constants, Promise, TextFilter, _, EventService } from '@ag-grid-community/core';
export var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType || (SetFilterModelValuesType = {}));
var SetValueModel = /** @class */ (function () {
    function SetValueModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters, suppressSorting, setIsLoading, valueFormatterService, column) {
        var _this = this;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.suppressSorting = suppressSorting;
        this.setIsLoading = setIsLoading;
        this.valueFormatterService = valueFormatterService;
        this.column = column;
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
        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel;
        }
        this.filterParams = this.colDef.filterParams || {};
        this.formatter = this.filterParams.textFormatter || TextFilter.DEFAULT_FORMATTER;
        var values = this.filterParams.values;
        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        }
        else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;
            this.providedValues = values;
        }
        this.updateAllValues();
        // start with everything selected
        this.allValuesPromise.then(function (values) { return _this.selectedValues = _.convertToSet(values); });
    }
    SetValueModel.prototype.addEventListener = function (eventType, listener, async) {
        this.localEventService.addEventListener(eventType, listener, async);
    };
    SetValueModel.prototype.removeEventListener = function (eventType, listener, async) {
        this.localEventService.removeEventListener(eventType, listener, async);
    };
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false or selectAll is true, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    SetValueModel.prototype.refetchValues = function (keepSelection) {
        var _this = this;
        if (keepSelection === void 0) { keepSelection = true; }
        var currentModel = this.getModel();
        this.updateAllValues();
        // ensure model is updated for new values
        this.allValuesPromise.then(function () { return _this.setModel(keepSelection ? currentModel : null); });
    };
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    SetValueModel.prototype.overrideValues = function (valuesToUse, keepSelection) {
        var _this = this;
        if (keepSelection === void 0) { keepSelection = true; }
        // wait for any existing values to be populated before overriding
        this.allValuesPromise.then(function () {
            _this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
            _this.providedValues = valuesToUse;
            _this.refetchValues(keepSelection);
        });
    };
    SetValueModel.prototype.refreshAfterAnyFilterChanged = function () {
        if (this.showAvailableOnly()) {
            this.updateAvailableValues();
        }
    };
    SetValueModel.prototype.updateAllValues = function () {
        var _this = this;
        switch (this.valuesType) {
            case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
            case SetFilterModelValuesType.PROVIDED_LIST: {
                var values = this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES ?
                    this.getValuesFromRows(false) : _.toStrings(this.providedValues);
                var sortedValues = this.sortValues(values);
                this.allValues = sortedValues;
                this.allValuesPromise = Promise.resolve(sortedValues);
                break;
            }
            case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                this.setIsLoading(true);
                this.allValuesPromise = new Promise(function (resolve) {
                    var callback = _this.providedValues;
                    var params = {
                        success: function (values) {
                            var processedValues = _.toStrings(values);
                            _this.setIsLoading(false);
                            _this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                            _this.providedValues = processedValues;
                            var sortedValues = _this.sortValues(processedValues);
                            _this.allValues = sortedValues;
                            resolve(sortedValues);
                        },
                        colDef: _this.colDef
                    };
                    window.setTimeout(function () { return callback(params); }, 0);
                });
                break;
            }
            default:
                throw new Error('Unrecognised valuesType');
        }
        this.updateAvailableValues();
    };
    SetValueModel.prototype.setValuesType = function (value) {
        this.valuesType = value;
    };
    SetValueModel.prototype.getValuesType = function () {
        return this.valuesType;
    };
    SetValueModel.prototype.isValueAvailable = function (value) {
        return this.availableValues.has(value);
    };
    SetValueModel.prototype.showAvailableOnly = function () {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES &&
            !this.filterParams.suppressRemoveEntries;
    };
    SetValueModel.prototype.updateAvailableValues = function () {
        var _this = this;
        this.allValuesPromise.then(function (values) {
            var availableValues = _this.showAvailableOnly() ? _this.sortValues(_this.getValuesFromRows(true)) : values;
            _this.availableValues = _.convertToSet(availableValues);
            _this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
            _this.updateDisplayedValues();
        });
    };
    SetValueModel.prototype.sortValues = function (values) {
        if (this.suppressSorting) {
            return values;
        }
        var comparator = this.filterParams.comparator ||
            this.colDef.comparator ||
            _.defaultComparator;
        return values.sort(comparator);
    };
    SetValueModel.prototype.getValuesFromRows = function (removeUnavailableValues) {
        var _this = this;
        if (removeUnavailableValues === void 0) { removeUnavailableValues = false; }
        if (!this.clientSideRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }
        var values = new Set();
        var keyCreator = this.colDef.keyCreator;
        this.clientSideRowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || (removeUnavailableValues && !_this.doesRowPassOtherFilters(node))) {
                return;
            }
            var value = _this.valueGetter(node);
            if (keyCreator) {
                value = keyCreator({ value: value });
            }
            value = _.makeNull(value);
            if (value != null && Array.isArray(value)) {
                _.forEach(value, function (x) {
                    var formatted = _.toStringOrNull(_.makeNull(x));
                    values.add(formatted);
                });
            }
            else {
                values.add(_.toStringOrNull(value));
            }
        });
        return _.values(values);
    };
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    SetValueModel.prototype.setMiniFilter = function (value) {
        value = _.makeNull(value);
        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilterText = value;
        this.updateDisplayedValues();
        return true;
    };
    SetValueModel.prototype.getMiniFilter = function () {
        return this.miniFilterText;
    };
    SetValueModel.prototype.updateDisplayedValues = function () {
        var _this = this;
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayedValues = _.values(this.availableValues);
            return;
        }
        // if filter present, we filter down the list
        this.displayedValues = [];
        // to allow for case insensitive searches, upper-case both filter text and value
        var formattedFilterText = this.formatter(this.miniFilterText).toUpperCase();
        var matchesFilter = function (valueToCheck) {
            return valueToCheck != null && valueToCheck.toUpperCase().indexOf(formattedFilterText) >= 0;
        };
        this.availableValues.forEach(function (value) {
            if (value == null) {
                return;
            }
            var displayedValue = _this.formatter(value);
            var formattedValue = _this.valueFormatterService.formatValue(_this.column, null, null, displayedValue);
            if (matchesFilter(displayedValue) || matchesFilter(formattedValue)) {
                _this.displayedValues.push(value);
            }
        });
    };
    SetValueModel.prototype.getDisplayedValueCount = function () {
        return this.displayedValues.length;
    };
    SetValueModel.prototype.getDisplayedValue = function (index) {
        return this.displayedValues[index];
    };
    SetValueModel.prototype.isFilterActive = function () {
        return this.allValues.length !== this.selectedValues.size;
    };
    SetValueModel.prototype.getUniqueValueCount = function () {
        return this.allValues.length;
    };
    SetValueModel.prototype.getUniqueValue = function (index) {
        return this.allValues[index];
    };
    SetValueModel.prototype.selectAll = function (clearExistingSelection) {
        var _this = this;
        if (clearExistingSelection === void 0) { clearExistingSelection = false; }
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedValues = _.convertToSet(this.allValues);
        }
        else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedValues.clear();
            }
            _.forEach(this.displayedValues, function (value) { return _this.selectValue(value); });
        }
    };
    SetValueModel.prototype.selectNothing = function () {
        var _this = this;
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedValues.clear();
        }
        else {
            // ensure everything that matches the mini filter is deselected
            _.forEach(this.displayedValues, function (it) { return _this.deselectValue(it); });
        }
    };
    SetValueModel.prototype.selectValue = function (value) {
        this.selectedValues.add(value);
    };
    SetValueModel.prototype.deselectValue = function (value) {
        this.selectedValues.delete(value);
    };
    SetValueModel.prototype.isValueSelected = function (value) {
        return this.selectedValues.has(value);
    };
    SetValueModel.prototype.isEverythingSelected = function () {
        var _this = this;
        if (this.miniFilterText == null) {
            return this.allValues.length === this.selectedValues.size;
        }
        else {
            return _.filter(this.displayedValues, function (it) { return _this.isValueSelected(it); }).length === this.displayedValues.length;
        }
    };
    SetValueModel.prototype.isNothingSelected = function () {
        var _this = this;
        if (this.miniFilterText == null) {
            return this.selectedValues.size === 0;
        }
        else {
            return _.filter(this.displayedValues, function (it) { return _this.isValueSelected(it); }).length === 0;
        }
    };
    SetValueModel.prototype.getModel = function () {
        return this.isFilterActive() ? _.values(this.selectedValues) : null;
    };
    SetValueModel.prototype.setModel = function (model) {
        var _this = this;
        this.allValuesPromise.then(function (values) {
            if (model == null) {
                // reset to everything selected
                _this.selectedValues = _.convertToSet(values);
            }
            else {
                // select all values from the model that exist in the filter
                _this.selectedValues.clear();
                var allValues_1 = _.convertToSet(values);
                _.forEach(model, function (value) {
                    if (allValues_1.has(value)) {
                        _this.selectValue(value);
                    }
                });
            }
        });
    };
    SetValueModel.prototype.onFilterValuesReady = function (callback) {
        this.allValuesPromise.then(callback);
    };
    SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';
    return SetValueModel;
}());
export { SetValueModel };
