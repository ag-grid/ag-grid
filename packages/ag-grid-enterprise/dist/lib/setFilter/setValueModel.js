// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
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
var SetValueModel = /** @class */ (function () {
    function SetValueModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters, suppressSorting, modelUpdatedFunc, isLoadingFunc, valueFormatterService, column) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.modelUpdatedFunc = modelUpdatedFunc;
        this.isLoadingFunc = isLoadingFunc;
        this.valueFormatterService = valueFormatterService;
        this.column = column;
        if (rowModel.getType() === ag_grid_community_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel;
        }
        this.filterParams = this.colDef.filterParams ? this.colDef.filterParams : {};
        if (ag_grid_community_1._.exists(this.filterParams) && ag_grid_community_1._.exists(this.filterParams.values)) {
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
        this.selectAllUsingMiniFilter();
        this.formatter = this.filterParams.textFormatter ? this.filterParams.textFormatter : ag_grid_community_1.TextFilter.DEFAULT_FORMATTER;
    }
    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    SetValueModel.prototype.refreshAfterNewRowsLoaded = function (keepSelection, everythingSelected) {
        this.createAllUniqueValues();
        this.refreshSelection(keepSelection, everythingSelected);
    };
    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    SetValueModel.prototype.refreshValues = function (valuesToUse, keepSelection, isSelectAll) {
        this.setValues(valuesToUse);
        this.refreshSelection(keepSelection, isSelectAll);
    };
    SetValueModel.prototype.refreshSelection = function (keepSelection, isSelectAll) {
        this.createAvailableUniqueValues();
        var oldModel = Object.keys(this.selectedValuesMap);
        this.selectedValuesMap = {};
        this.processMiniFilter();
        if (keepSelection) {
            this.setModel(oldModel, isSelectAll);
        }
        else {
            this.selectAllUsingMiniFilter();
        }
    };
    SetValueModel.prototype.refreshAfterAnyFilterChanged = function () {
        if (this.showingAvailableOnly) {
            this.createAvailableUniqueValues();
            this.processMiniFilter();
        }
    };
    SetValueModel.prototype.createAllUniqueValues = function () {
        if (this.areValuesSync()) {
            var valuesToUse = this.extractSyncValuesToUse();
            this.setValues(valuesToUse);
            this.filterValuesPromise = ag_grid_community_1.Promise.resolve([]);
        }
        else {
            this.filterValuesExternalPromise = ag_grid_community_1.Promise.external();
            this.filterValuesPromise = this.filterValuesExternalPromise.promise;
            this.isLoadingFunc(true);
            this.setValues([]);
            var callback_1 = this.filterParams.values;
            var params_1 = {
                success: this.onAsyncValuesLoaded.bind(this),
                colDef: this.colDef
            };
            window.setTimeout(function () { return callback_1(params_1); }, 0);
        }
    };
    SetValueModel.prototype.onAsyncValuesLoaded = function (values) {
        this.modelUpdatedFunc(values);
        this.isLoadingFunc(false);
        this.filterValuesExternalPromise.resolve(values);
    };
    SetValueModel.prototype.areValuesSync = function () {
        return this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.NOT_PROVIDED;
    };
    SetValueModel.prototype.setValuesType = function (value) {
        this.valuesType = value;
    };
    SetValueModel.prototype.getValuesType = function () {
        return this.valuesType;
    };
    SetValueModel.prototype.setValues = function (valuesToUse) {
        this.allUniqueValues = valuesToUse;
        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    };
    SetValueModel.prototype.extractSyncValuesToUse = function () {
        var valuesToUse;
        if (this.valuesType == SetFilterModelValuesType.PROVIDED_LIST) {
            if (Array.isArray(this.filterParams.values)) {
                valuesToUse = ag_grid_community_1._.toStrings(this.filterParams.values);
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
            valuesToUse = ag_grid_community_1._.toStrings(uniqueValuesAsAnyObjects);
        }
        return valuesToUse;
    };
    SetValueModel.prototype.createAvailableUniqueValues = function () {
        var dontCheckAvailableValues = !this.showingAvailableOnly || this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.PROVIDED_CB;
        if (dontCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
            return;
        }
        var uniqueValuesAsAnyObjects = this.getUniqueValues(true);
        this.availableUniqueValues = ag_grid_community_1._.toStrings(uniqueValuesAsAnyObjects);
        this.sortValues(this.availableUniqueValues);
    };
    SetValueModel.prototype.sortValues = function (values) {
        if (this.filterParams && this.filterParams.comparator) {
            values.sort(this.filterParams.comparator);
        }
        else if (this.colDef.comparator) {
            values.sort(this.colDef.comparator);
        }
        else {
            values.sort(ag_grid_community_1._.defaultComparator);
        }
    };
    SetValueModel.prototype.getUniqueValues = function (filterOutNotAvailable) {
        var _this = this;
        var uniqueCheck = {};
        var result = [];
        if (!this.clientSideRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }
        this.clientSideRowModel.forEachLeafNode(function (node) {
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
    SetValueModel.prototype.setMiniFilter = function (newMiniFilter) {
        newMiniFilter = ag_grid_community_1._.makeNull(newMiniFilter);
        if (this.miniFilter === newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.processMiniFilter();
        return true;
    };
    SetValueModel.prototype.getMiniFilter = function () {
        return this.miniFilter;
    };
    SetValueModel.prototype.processMiniFilter = function () {
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
        //This function encapsulates the logic to check if a string matches the mini filter
        var matchesFn = function (valueToCheck) {
            if (valueToCheck == null) {
                return false;
            }
            // allow for case insensitive searches, make both filter and value uppercase
            var valueUpperCase = valueToCheck.toUpperCase();
            return valueUpperCase.indexOf(miniFilterUpperCase) >= 0;
        };
        for (var i = 0, l = this.availableUniqueValues.length; i < l; i++) {
            var value = this.availableUniqueValues[i];
            if (value) {
                var displayedValue = this.formatter(value.toString());
                var formattedValue = this.valueFormatterService.formatValue(this.column, null, null, displayedValue);
                if (matchesFn(displayedValue) || matchesFn(formattedValue)) {
                    this.displayedValues.push(value);
                }
            }
        }
    };
    SetValueModel.prototype.getDisplayedValueCount = function () {
        return this.displayedValues.length;
    };
    SetValueModel.prototype.getDisplayedValue = function (index) {
        return this.displayedValues[index];
    };
    SetValueModel.prototype.selectAllUsingMiniFilter = function () {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectOn(this.allUniqueValues);
        }
        else {
            this.selectOn(this.displayedValues);
        }
    };
    SetValueModel.prototype.selectOn = function (toSelectOn) {
        var count = toSelectOn.length;
        for (var i = 0; i < count; i++) {
            var key = toSelectOn[i];
            var safeKey = this.valueToKey(key);
            this.selectedValuesMap[safeKey] = null;
        }
        this.selectedValuesCount = Object.keys(this.selectedValuesMap).length;
    };
    SetValueModel.prototype.valueToKey = function (key) {
        if (key === null) {
            return NULL_VALUE;
        }
        else {
            return key;
        }
    };
    SetValueModel.prototype.keyToValue = function (value) {
        if (value === NULL_VALUE) {
            return null;
        }
        else {
            return value;
        }
    };
    SetValueModel.prototype.isFilterActive = function () {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    };
    SetValueModel.prototype.selectNothingUsingMiniFilter = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectNothing();
        }
        else {
            this.displayedValues.forEach(function (it) { return _this.unselectValue(it); });
        }
    };
    SetValueModel.prototype.selectNothing = function () {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };
    SetValueModel.prototype.getUniqueValueCount = function () {
        return this.allUniqueValues.length;
    };
    SetValueModel.prototype.getUniqueValue = function (index) {
        return this.allUniqueValues[index];
    };
    SetValueModel.prototype.unselectValue = function (value) {
        var safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] !== undefined) {
            delete this.selectedValuesMap[safeKey];
            this.selectedValuesCount--;
        }
    };
    SetValueModel.prototype.selectAllFromMiniFilter = function () {
        this.selectNothing();
        this.selectAllUsingMiniFilter();
    };
    SetValueModel.prototype.selectValue = function (value) {
        var safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] === undefined) {
            this.selectedValuesMap[safeKey] = null;
            this.selectedValuesCount++;
        }
    };
    SetValueModel.prototype.isValueSelected = function (value) {
        var safeKey = this.valueToKey(value);
        return this.selectedValuesMap[safeKey] !== undefined;
    };
    SetValueModel.prototype.isEverythingSelected = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.allUniqueValues.length === this.selectedValuesCount;
        }
        else {
            return this.displayedValues.filter(function (it) { return _this.isValueSelected(it); }).length === this.displayedValues.length;
        }
    };
    SetValueModel.prototype.isNothingSelected = function () {
        var _this = this;
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.selectedValuesCount === 0;
        }
        else {
            return this.displayedValues.filter(function (it) { return _this.isValueSelected(it); }).length === 0;
        }
    };
    SetValueModel.prototype.getModel = function () {
        var _this = this;
        if (!this.isFilterActive()) {
            return null;
        }
        var selectedValues = [];
        ag_grid_community_1._.iterateObject(this.selectedValuesMap, function (key) {
            var value = _this.keyToValue(key);
            selectedValues.push(value);
        });
        return selectedValues;
    };
    SetValueModel.prototype.setModel = function (model, isSelectAll) {
        var _this = this;
        if (isSelectAll === void 0) { isSelectAll = false; }
        if (this.areValuesSync()) {
            this.setSyncModel(model, isSelectAll);
        }
        else {
            this.filterValuesExternalPromise.promise.then(function (values) {
                _this.setSyncModel(model, isSelectAll);
                _this.modelUpdatedFunc(values, model);
            });
        }
    };
    SetValueModel.prototype.setSyncModel = function (model, isSelectAll) {
        if (isSelectAll === void 0) { isSelectAll = false; }
        if (model && !isSelectAll) {
            this.selectNothingUsingMiniFilter();
            for (var i = 0; i < model.length; i++) {
                var rawValue = model[i];
                var value = this.keyToValue(rawValue);
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        }
        else {
            this.selectAllUsingMiniFilter();
        }
    };
    SetValueModel.prototype.onFilterValuesReady = function (callback) {
        //This guarantees that if the user is racing to set values async into the set filter, only the first instance
        //will be used
        // ie Values are async and the user manually wants to override them before the retrieval of values is triggered
        // (set filter values in the following example)
        // http://plnkr.co/edit/eFka7ynvPj68tL3VJFWf?p=preview
        this.filterValuesPromise.firstOneOnly(callback);
    };
    return SetValueModel;
}());
exports.SetValueModel = SetValueModel;
