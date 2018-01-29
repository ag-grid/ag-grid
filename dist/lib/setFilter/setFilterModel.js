// ag-grid-enterprise v16.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var ag_grid_1 = require("ag-grid");
var ag_grid_2 = require("ag-grid");
// we cannot have 'null' as a key in a JavaScript map,
// it needs to be a string. so we use this string for
// storing null values.
var NULL_VALUE = '___NULL___';
var SetFilterModelValuesType;
(function (SetFilterModelValuesType) {
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_LIST"] = 0] = "PROVIDED_LIST";
    SetFilterModelValuesType[SetFilterModelValuesType["PROVIDED_CB"] = 1] = "PROVIDED_CB";
    SetFilterModelValuesType[SetFilterModelValuesType["NOT_PROVIDED"] = 2] = "NOT_PROVIDED";
})(SetFilterModelValuesType = exports.SetFilterModelValuesType || (exports.SetFilterModelValuesType = {}));
var SetFilterModel = (function () {
    function SetFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters, suppressSorting, modelUpdatedFunc, isLoadingFunc) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.modelUpdatedFunc = modelUpdatedFunc;
        this.isLoadingFunc = isLoadingFunc;
        if (rowModel.getType() === ag_grid_1.Constants.ROW_MODEL_TYPE_IN_MEMORY) {
            this.inMemoryRowModel = rowModel;
        }
        this.filterParams = this.colDef.filterParams ? this.colDef.filterParams : {};
        if (main_1.Utils.exists(this.filterParams) && main_1.Utils.exists(this.filterParams.values)) {
            this.valuesType = Array.isArray(this.filterParams.values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CB;
            this.showingAvailableOnly = this.filterParams.suppressRemoveEntries !== true;
        }
        else {
            this.valuesType = SetFilterModelValuesType.NOT_PROVIDED;
            this.showingAvailableOnly = true;
        }
        this.createAllUniqueValues();
        this.createAvailableUniqueValues();
        // by default, no filter, so we display everything
        this.displayedValues = this.availableUniqueValues;
        this.miniFilter = null;
        // we use a map rather than an array for the selected values as the lookup
        // for a map is much faster than the lookup for an array, especially when
        // the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
        this.formatter = this.filterParams.textFormatter ? this.filterParams.textFormatter : main_2.TextFilter.DEFAULT_FORMATTER;
    }
    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    SetFilterModel.prototype.refreshAfterNewRowsLoaded = function (keepSelection, isSelectAll) {
        this.createAllUniqueValues();
        this.refreshSelection(keepSelection, isSelectAll);
    };
    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    SetFilterModel.prototype.refreshValues = function (valuesToUse, keepSelection, isSelectAll) {
        this.setValues(valuesToUse);
        this.refreshSelection(keepSelection, isSelectAll);
    };
    SetFilterModel.prototype.refreshSelection = function (keepSelection, isSelectAll) {
        this.createAvailableUniqueValues();
        var oldModel = Object.keys(this.selectedValuesMap);
        this.selectedValuesMap = {};
        this.processMiniFilter();
        if (keepSelection) {
            this.setModel(oldModel, isSelectAll);
        }
        else {
            this.selectEverything();
        }
    };
    SetFilterModel.prototype.refreshAfterAnyFilterChanged = function () {
        if (this.showingAvailableOnly) {
            this.createAvailableUniqueValues();
            this.processMiniFilter();
        }
    };
    SetFilterModel.prototype.createAllUniqueValues = function () {
        if (this.areValuesSync()) {
            var valuesToUse = this.extractSyncValuesToUse();
            this.setValues(valuesToUse);
            this.filterValuesPromise = ag_grid_2.Promise.resolve(null);
        }
        else {
            this.filterValuesExternalPromise = ag_grid_2.Promise.external();
            this.filterValuesPromise = this.filterValuesExternalPromise.promise;
            this.isLoadingFunc(true);
            this.setValues([]);
            var callback = this.filterParams.values;
            var params = {
                success: this.onAsyncValuesLoaded.bind(this)
            };
            callback(params);
        }
    };
    SetFilterModel.prototype.onAsyncValuesLoaded = function (values) {
        this.modelUpdatedFunc(values);
        this.isLoadingFunc(false);
        this.filterValuesExternalPromise.resolve(null);
    };
    SetFilterModel.prototype.areValuesSync = function () {
        return this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.NOT_PROVIDED;
    };
    SetFilterModel.prototype.setValuesType = function (value) {
        this.valuesType = value;
    };
    SetFilterModel.prototype.setValues = function (valuesToUse) {
        this.allUniqueValues = valuesToUse;
        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    };
    SetFilterModel.prototype.extractSyncValuesToUse = function () {
        var valuesToUse;
        if (this.valuesType == SetFilterModelValuesType.PROVIDED_LIST) {
            if (Array.isArray(this.filterParams.values)) {
                valuesToUse = main_1.Utils.toStrings(this.filterParams.values);
            }
            else {
                // In this case the values are async but have already been resolved, so we can reuse them
                valuesToUse = this.allUniqueValues;
            }
        }
        else if (this.valuesType == SetFilterModelValuesType.PROVIDED_CB) {
            throw Error("ag-grid: Error extracting values to use. We should not extract the values synchronously when using a callback for the filterParams.values");
        }
        else {
            var uniqueValuesAsAnyObjects = this.getUniqueValues(false);
            valuesToUse = main_1.Utils.toStrings(uniqueValuesAsAnyObjects);
        }
        return valuesToUse;
    };
    SetFilterModel.prototype.createAvailableUniqueValues = function () {
        var dontCheckAvailableValues = !this.showingAvailableOnly || this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.PROVIDED_CB;
        if (dontCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
            return;
        }
        var uniqueValuesAsAnyObjects = this.getUniqueValues(true);
        this.availableUniqueValues = main_1.Utils.toStrings(uniqueValuesAsAnyObjects);
        this.sortValues(this.availableUniqueValues);
    };
    SetFilterModel.prototype.sortValues = function (values) {
        if (this.filterParams && this.filterParams.comparator) {
            values.sort(this.filterParams.comparator);
        }
        else if (this.colDef.comparator) {
            values.sort(this.colDef.comparator);
        }
        else {
            values.sort(main_1.Utils.defaultComparator);
        }
    };
    SetFilterModel.prototype.getUniqueValues = function (filterOutNotAvailable) {
        var _this = this;
        var uniqueCheck = {};
        var result = [];
        if (!this.inMemoryRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }
        this.inMemoryRowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data) {
                return;
            }
            var value = _this.valueGetter(node);
            if (_this.colDef.keyCreator) {
                value = _this.colDef.keyCreator({ value: value });
            }
            if (value === "" || value === undefined) {
                value = null;
            }
            if (filterOutNotAvailable) {
                if (!_this.doesRowPassOtherFilters(node)) {
                    return;
                }
            }
            if (value != null && Array.isArray(value)) {
                for (var j = 0; j < value.length; j++) {
                    addUniqueValueIfMissing(value[j]);
                }
            }
            else {
                addUniqueValueIfMissing(value);
            }
        });
        function addUniqueValueIfMissing(value) {
            if (!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        return result;
    };
    //sets mini filter. returns true if it changed from last value, otherwise false
    SetFilterModel.prototype.setMiniFilter = function (newMiniFilter) {
        newMiniFilter = main_1.Utils.makeNull(newMiniFilter);
        if (this.miniFilter === newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.processMiniFilter();
        return true;
    };
    SetFilterModel.prototype.getMiniFilter = function () {
        return this.miniFilter;
    };
    SetFilterModel.prototype.processMiniFilter = function () {
        // if no filter, just use the unique values
        if (this.miniFilter === null) {
            this.displayedValues = this.availableUniqueValues;
            return;
        }
        // if filter present, we filter down the list
        this.displayedValues = [];
        var miniFilter = this.formatter(this.miniFilter);
        // make upper case to have search case insensitive
        var miniFilterUpperCase = miniFilter.toUpperCase();
        for (var i = 0, l = this.availableUniqueValues.length; i < l; i++) {
            var filteredValue = this.availableUniqueValues[i];
            if (filteredValue) {
                var value = this.formatter(filteredValue.toString());
                if (value !== null) {
                    // allow for case insensitive searches, make both filter and value uppercase
                    var valueUpperCase = value.toUpperCase();
                    if (valueUpperCase.indexOf(miniFilterUpperCase) >= 0) {
                        this.displayedValues.push(filteredValue);
                    }
                }
            }
        }
    };
    SetFilterModel.prototype.getDisplayedValueCount = function () {
        return this.displayedValues.length;
    };
    SetFilterModel.prototype.getDisplayedValue = function (index) {
        return this.displayedValues[index];
    };
    SetFilterModel.prototype.selectEverything = function () {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectOn(this.allUniqueValues);
        }
        else {
            this.selectOn(this.displayedValues);
        }
    };
    SetFilterModel.prototype.selectOn = function (toSelectOn) {
        var count = toSelectOn.length;
        for (var i = 0; i < count; i++) {
            var key = toSelectOn[i];
            var safeKey = this.valueToKey(key);
            this.selectedValuesMap[safeKey] = null;
        }
        this.selectedValuesCount = count;
    };
    SetFilterModel.prototype.valueToKey = function (key) {
        if (key === null) {
            return NULL_VALUE;
        }
        else {
            return key;
        }
    };
    SetFilterModel.prototype.keyToValue = function (value) {
        if (value === NULL_VALUE) {
            return null;
        }
        else {
            return value;
        }
    };
    SetFilterModel.prototype.isFilterActive = function () {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    };
    SetFilterModel.prototype.selectNothing = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectedValuesMap = {};
            this.selectedValuesCount = 0;
        }
        else {
            this.displayedValues.forEach(function (it) { return _this.unselectValue(it); });
        }
    };
    SetFilterModel.prototype.getUniqueValueCount = function () {
        return this.allUniqueValues.length;
    };
    SetFilterModel.prototype.getUniqueValue = function (index) {
        return this.allUniqueValues[index];
    };
    SetFilterModel.prototype.unselectValue = function (value) {
        var safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] !== undefined) {
            delete this.selectedValuesMap[safeKey];
            this.selectedValuesCount--;
        }
    };
    SetFilterModel.prototype.selectValue = function (value) {
        var safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] === undefined) {
            this.selectedValuesMap[safeKey] = null;
            this.selectedValuesCount++;
        }
    };
    SetFilterModel.prototype.isValueSelected = function (value) {
        var safeKey = this.valueToKey(value);
        return this.selectedValuesMap[safeKey] !== undefined;
    };
    SetFilterModel.prototype.isEverythingSelected = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.allUniqueValues.length === this.selectedValuesCount;
        }
        else {
            return this.displayedValues.filter(function (it) { return _this.isValueSelected(it); }).length === this.displayedValues.length;
        }
    };
    SetFilterModel.prototype.isNothingSelected = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.selectedValuesCount === 0;
        }
        else {
            return this.displayedValues.filter(function (it) { return _this.isValueSelected(it); }).length === 0;
        }
    };
    SetFilterModel.prototype.getModel = function () {
        var _this = this;
        if (!this.isFilterActive()) {
            return null;
        }
        var selectedValues = [];
        main_1.Utils.iterateObject(this.selectedValuesMap, function (key) {
            var value = _this.keyToValue(key);
            selectedValues.push(value);
        });
        return selectedValues;
    };
    SetFilterModel.prototype.setModel = function (model, isSelectAll) {
        if (isSelectAll === void 0) { isSelectAll = false; }
        if (model && !isSelectAll) {
            this.selectNothing();
            for (var i = 0; i < model.length; i++) {
                var rawValue = model[i];
                var value = this.keyToValue(rawValue);
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        }
        else {
            this.selectEverything();
        }
    };
    SetFilterModel.prototype.onFilterValuesReady = function (callback) {
        //This guarantees that if the user is racing to set values async into the set filter, only the first instance
        //will be used
        // ie Values are async and the user manually wants to override them before the retrieval of values is triggered
        // (set filter values in the following example)
        // http://plnkr.co/edit/eFka7ynvPj68tL3VJFWf?p=preview
        this.filterValuesPromise.firstOneOnly(callback);
    };
    return SetFilterModel;
}());
exports.SetFilterModel = SetFilterModel;
