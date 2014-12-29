define(["./utils"], function(utils) {

    'use strict';

    function FilterModel(uniqueValues) {
        this.uniqueValues = uniqueValues;
        this.displayedValues = uniqueValues;
        this.miniFilter = null;
        //we use a map rather than an array for the selected values as the lookup
        //for a map is much faster than the lookup for an array, especially when
        //the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
    }

    //sets mini filter. returns true if it changed from last value, otherwise false
    FilterModel.prototype.setMiniFilter = function(newMiniFilter) {
        newMiniFilter = utils.makeNull(newMiniFilter);
        if (this.miniFilter===newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.filterDisplayedValues();
        return true;
    };

    FilterModel.prototype.getMiniFilter = function() {
        return this.miniFilter;
    };

    FilterModel.prototype.filterDisplayedValues = function() {
        //if no filter, just use the unique values
        if (this.miniFilter===null) {
            this.displayedValues = this.uniqueValues;
            return;
        }

        //if filter present, we filter down the list
        this.displayedValues = [];
        var miniFilterUpperCase = this.miniFilter.toUpperCase();
        for (var i = 0, l = this.uniqueValues.length; i<l; i++) {
            var uniqueValue = this.uniqueValues[i];
            if (uniqueValue!==null && uniqueValue.toUpperCase().indexOf(miniFilterUpperCase)>=0) {
                this.displayedValues.push(uniqueValue);
            }
        }

    };

    FilterModel.prototype.getDisplayedValueCount = function() {
        return this.displayedValues.length;
    };

    FilterModel.prototype.getDisplayedValue = function(index) {
        return this.displayedValues[index];
    };

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