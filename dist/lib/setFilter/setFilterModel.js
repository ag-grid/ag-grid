// ag-grid-enterprise v8.0.0
"use strict";
var main_1 = require("ag-grid/main");
// we cannot have 'null' as a key in a JavaScript map,
// it needs to be a string. so we use this string for
// storing null values.
var NULL_VALUE = '___NULL___';
var SetFilterModel = (function () {
    function SetFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters, suppressSorting) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.rowModel = rowModel;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.filterParams = this.colDef.filterParams;
        if (main_1.Utils.exists(this.filterParams)) {
            this.usingProvidedSet = main_1.Utils.exists(this.filterParams.values);
            this.showingAvailableOnly = this.filterParams.suppressRemoveEntries !== true;
        }
        else {
            this.usingProvidedSet = false;
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
    }
    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    SetFilterModel.prototype.refreshAfterNewRowsLoaded = function (keepSelection, isSelectAll) {
        this.createAllUniqueValues();
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
        if (this.usingProvidedSet) {
            this.allUniqueValues = main_1.Utils.toStrings(this.filterParams.values);
        }
        else {
            var uniqueValuesAsAnyObjects = this.getUniqueValues(false);
            this.allUniqueValues = main_1.Utils.toStrings(uniqueValuesAsAnyObjects);
        }
        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    };
    SetFilterModel.prototype.createAvailableUniqueValues = function () {
        var dontCheckAvailableValues = !this.showingAvailableOnly || this.usingProvidedSet;
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
        if (!this.rowModel.forEachLeafNode) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }
        this.rowModel.forEachLeafNode(function (node) {
            if (!node.group) {
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
        var miniFilterUpperCase = this.miniFilter.toUpperCase();
        for (var i = 0, l = this.availableUniqueValues.length; i < l; i++) {
            var filteredValue = this.availableUniqueValues[i];
            if (filteredValue !== null && filteredValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                this.displayedValues.push(filteredValue);
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
        var count = this.allUniqueValues.length;
        for (var i = 0; i < count; i++) {
            var key = this.allUniqueValues[i];
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
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
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
        return this.allUniqueValues.length === this.selectedValuesCount;
    };
    SetFilterModel.prototype.isNothingSelected = function () {
        return this.selectedValuesCount === 0;
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
                var value = model[i];
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        }
        else {
            this.selectEverything();
        }
    };
    return SetFilterModel;
}());
exports.SetFilterModel = SetFilterModel;
