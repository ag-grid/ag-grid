"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CALLBACK"] = 1] = "PROVIDED_CALLBACK";
    SetFilterModelValuesType[SetFilterModelValuesType["TAKEN_FROM_GRID_VALUES"] = 2] = "TAKEN_FROM_GRID_VALUES";
})(SetFilterModelValuesType = exports.SetFilterModelValuesType || (exports.SetFilterModelValuesType = {}));
var SetValueModel = /** @class */ (function () {
    function SetValueModel(rowModel, colDef, column, valueGetter, doesRowPassOtherFilters, suppressSorting, setIsLoading, valueFormatterService, translate) {
        var _this = this;
        this.colDef = colDef;
        this.column = column;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.suppressSorting = suppressSorting;
        this.setIsLoading = setIsLoading;
        this.valueFormatterService = valueFormatterService;
        this.translate = translate;
        this.localEventService = new core_1.EventService();
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
        if (rowModel.getType() === core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel;
        }
        this.filterParams = this.colDef.filterParams || {};
        this.formatter = this.filterParams.textFormatter || core_1.TextFilter.DEFAULT_FORMATTER;
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
        this.updateAllValues().then(function (values) { return _this.resetSelectionState(values); });
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
    SetValueModel.prototype.refreshValues = function (keepSelection) {
        if (keepSelection === void 0) { keepSelection = true; }
        var currentModel = this.getModel();
        this.updateAllValues();
        // ensure model is updated for new values
        return this.setModel(keepSelection ? currentModel : null);
    };
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    SetValueModel.prototype.overrideValues = function (valuesToUse, keepSelection) {
        var _this = this;
        if (keepSelection === void 0) { keepSelection = true; }
        return new core_1.Promise(function (resolve) {
            // wait for any existing values to be populated before overriding
            _this.allValuesPromise.then(function () {
                _this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                _this.providedValues = valuesToUse;
                _this.refreshValues(keepSelection).then(function () { return resolve(); });
            });
        });
    };
    SetValueModel.prototype.refreshAfterAnyFilterChanged = function () {
        var _this = this;
        if (this.showAvailableOnly()) {
            this.allValuesPromise.then(function (values) { return _this.updateAvailableValues(values); });
        }
    };
    SetValueModel.prototype.updateAllValues = function () {
        var _this = this;
        this.allValuesPromise = new core_1.Promise(function (resolve) {
            switch (_this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    var values = _this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES ?
                        _this.getValuesFromRows(false) : core_1._.toStrings(_this.providedValues);
                    var sortedValues = _this.sortValues(values);
                    _this.allValues = sortedValues;
                    resolve(sortedValues);
                    break;
                }
                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    _this.setIsLoading(true);
                    var callback_1 = _this.providedValues;
                    var params_1 = {
                        success: function (values) {
                            var processedValues = core_1._.toStrings(values);
                            _this.setIsLoading(false);
                            var sortedValues = _this.sortValues(processedValues);
                            _this.allValues = sortedValues;
                            resolve(sortedValues);
                        },
                        colDef: _this.colDef
                    };
                    window.setTimeout(function () { return callback_1(params_1); }, 0);
                    break;
                }
                default:
                    throw new Error('Unrecognised valuesType');
            }
        });
        this.allValuesPromise.then(function (values) { return _this.updateAvailableValues(values); });
        return this.allValuesPromise;
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
    SetValueModel.prototype.updateAvailableValues = function (allValues) {
        var availableValues = this.showAvailableOnly() ? this.sortValues(this.getValuesFromRows(true)) : allValues;
        this.availableValues = core_1._.convertToSet(availableValues);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
        this.updateDisplayedValues();
    };
    SetValueModel.prototype.sortValues = function (values) {
        if (this.suppressSorting) {
            return values;
        }
        var comparator = this.filterParams.comparator ||
            this.colDef.comparator ||
            core_1._.defaultComparator;
        if (!this.filterParams.excelMode || values.indexOf(null) < 0) {
            return values.sort(comparator);
        }
        // ensure the blank value always appears last
        return core_1._.filter(values, function (v) { return v != null; }).sort(comparator).concat(null);
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
            value = core_1._.makeNull(value);
            if (value != null && Array.isArray(value)) {
                core_1._.forEach(value, function (x) {
                    var formatted = core_1._.toStringOrNull(core_1._.makeNull(x));
                    values.add(formatted);
                });
            }
            else {
                values.add(core_1._.toStringOrNull(value));
            }
        });
        return core_1._.values(values);
    };
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    SetValueModel.prototype.setMiniFilter = function (value) {
        value = core_1._.makeNull(value);
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
            this.displayedValues = core_1._.values(this.availableValues);
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
                if (_this.filterParams.excelMode && matchesFilter("(" + _this.translate('blanks') + ")")) {
                    _this.displayedValues.push(value);
                }
            }
            else {
                var textFormatterValue = _this.formatter(value);
                // TODO: should this be applying the text formatter *after* the value formatter?
                var valueFormatterValue = _this.valueFormatterService.formatValue(_this.column, null, null, textFormatterValue);
                if (matchesFilter(textFormatterValue) || matchesFilter(valueFormatterValue)) {
                    _this.displayedValues.push(value);
                }
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
        return this.filterParams.defaultToNothingSelected ?
            this.selectedValues.size > 0 :
            this.allValues.length !== this.selectedValues.size;
    };
    SetValueModel.prototype.getUniqueValueCount = function () {
        return this.allValues.length;
    };
    SetValueModel.prototype.getUniqueValue = function (index) {
        return this.allValues[index];
    };
    SetValueModel.prototype.getValues = function () {
        return this.allValues.slice();
    };
    SetValueModel.prototype.selectAllMatchingMiniFilter = function (clearExistingSelection) {
        var _this = this;
        if (clearExistingSelection === void 0) { clearExistingSelection = false; }
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedValues = core_1._.convertToSet(this.allValues);
        }
        else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedValues.clear();
            }
            core_1._.forEach(this.displayedValues, function (value) { return _this.selectedValues.add(value); });
        }
    };
    SetValueModel.prototype.deselectAllMatchingMiniFilter = function () {
        var _this = this;
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedValues.clear();
        }
        else {
            // ensure everything that matches the mini filter is deselected
            core_1._.forEach(this.displayedValues, function (value) { return _this.selectedValues.delete(value); });
        }
    };
    SetValueModel.prototype.selectValue = function (value) {
        this.selectedValues.add(value);
    };
    SetValueModel.prototype.deselectValue = function (value) {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayedValues);
        }
        this.selectedValues.delete(value);
    };
    SetValueModel.prototype.isValueSelected = function (value) {
        return this.selectedValues.has(value);
    };
    SetValueModel.prototype.isEverythingVisibleSelected = function () {
        var _this = this;
        return core_1._.filter(this.displayedValues, function (it) { return _this.isValueSelected(it); }).length === this.displayedValues.length;
    };
    SetValueModel.prototype.isNothingVisibleSelected = function () {
        var _this = this;
        return core_1._.filter(this.displayedValues, function (it) { return _this.isValueSelected(it); }).length === 0;
    };
    SetValueModel.prototype.getModel = function () {
        return this.isFilterActive() ? core_1._.values(this.selectedValues) : null;
    };
    SetValueModel.prototype.setModel = function (model) {
        var _this = this;
        return this.allValuesPromise.then(function (values) {
            if (model == null) {
                _this.resetSelectionState(values);
            }
            else {
                // select all values from the model that exist in the filter
                _this.selectedValues.clear();
                var allValues_1 = core_1._.convertToSet(values);
                core_1._.forEach(model, function (value) {
                    if (allValues_1.has(value)) {
                        _this.selectedValues.add(value);
                    }
                });
            }
        });
    };
    SetValueModel.prototype.resetSelectionState = function (values) {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedValues.clear();
        }
        else {
            this.selectedValues = core_1._.convertToSet(values);
        }
    };
    SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';
    return SetValueModel;
}());
exports.SetValueModel = SetValueModel;
//# sourceMappingURL=setValueModel.js.map