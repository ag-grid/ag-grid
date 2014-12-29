define(["./utils"], function(utils) {

    'use strict';

    function FilterModel(uniqueValues) {
        this.uniqueValues = uniqueValues;
        //we use a map rather than an array for the selected values as the lookup
        //for a map is much faster than the lookup for an array, especially when
        //the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
    }

    FilterModel.prototype.doesFilterPass = function(value) {
        //if no filter, always pass
        if (this.isEverythingSelected()) { return true; }
        //if nothing selected in filter, always fail
        if (this.isNothingSelected()) { return false; }

        value = utils.makeNull(value);
        var filterPassed = this.selectedValuesMap[value]!==undefined;
        return filterPassed;
    };

    FilterModel.prototype.selectEverything = function() {
        var count = this.uniqueValues.length;
        for (var i = 0; i<count; i++) {
            var value = this.uniqueValues[i];
            this.selectedValuesMap[value] = null;
        }
        this.selectedValuesCount = count;
    };

    FilterModel.prototype.isFilterActive = function() {
        return this.uniqueValues.length!==this.selectedValuesCount;
    };

    FilterModel.prototype.selectNothing = function() {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };

    FilterModel.prototype.getUniqueValueCount = function() {
        return this.uniqueValues.length;
    };

    FilterModel.prototype.getUniqueValue = function(index) {
        return this.uniqueValues[index];
    };

    FilterModel.prototype.unselectValue = function(value) {
        if (this.selectedValuesMap[value]!==undefined) {
            delete this.selectedValuesMap[value];
            this.selectedValuesCount--;
        }
    };

    FilterModel.prototype.selectValue = function(value) {
        if (this.selectedValuesMap[value]===undefined) {
            this.selectedValuesMap[value] = null;
            this.selectedValuesCount++;
        }
    };

    FilterModel.prototype.isValueSelected = function(value) {
        return this.selectedValuesMap[value] !== undefined;
    };

    FilterModel.prototype.isEverythingSelected = function() {
        return this.uniqueValues.length === this.selectedValuesCount;
    };

    FilterModel.prototype.isNothingSelected = function() {
        return this.uniqueValues.length === 0;
    };

    return function(uniqueValues) {
        return new FilterModel(uniqueValues);
    };

});