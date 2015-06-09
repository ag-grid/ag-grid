var utils = require('../utils');

function SetFilterModel(colDef, rowModel, valueGetter) {

    if (colDef.filterParams && colDef.filterParams.values) {
        this.uniqueValues = colDef.filterParams.values;
    } else {
        this.createUniqueValues(rowModel, colDef.field, valueGetter);
    }

    if (colDef.comparator) {
        this.uniqueValues.sort(colDef.comparator);
    } else {
        this.uniqueValues.sort(utils.defaultComparator);
    }

    this.displayedValues = this.uniqueValues;
    this.miniFilter = null;
    //we use a map rather than an array for the selected values as the lookup
    //for a map is much faster than the lookup for an array, especially when
    //the length of the array is thousands of records long
    this.selectedValuesMap = {};
    this.selectEverything();
}

SetFilterModel.prototype.createUniqueValues = function(rowModel, key, valueGetter) {
    var uniqueCheck = {};
    var result = [];

    function recursivelyProcess(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.group && !node.footer) {
                // group node, so dig deeper
                recursivelyProcess(node.children);
            } else {
                var value = valueGetter(node);
                if (value === "" || value === undefined) {
                    value = null;
                }
                if (!uniqueCheck.hasOwnProperty(value)) {
                    result.push(value);
                    uniqueCheck[value] = 1;
                }
            }
        }
    }

    var topLevelNodes = rowModel.getTopLevelNodes();
    recursivelyProcess(topLevelNodes);

    this.uniqueValues = result;
};

//sets mini filter. returns true if it changed from last value, otherwise false
SetFilterModel.prototype.setMiniFilter = function(newMiniFilter) {
    newMiniFilter = utils.makeNull(newMiniFilter);
    if (this.miniFilter === newMiniFilter) {
        //do nothing if filter has not changed
        return false;
    }
    this.miniFilter = newMiniFilter;
    this.filterDisplayedValues();
    return true;
};

SetFilterModel.prototype.getMiniFilter = function() {
    return this.miniFilter;
};

SetFilterModel.prototype.filterDisplayedValues = function() {
    // if no filter, just use the unique values
    if (this.miniFilter === null) {
        this.displayedValues = this.uniqueValues;
        return;
    }

    // if filter present, we filter down the list
    this.displayedValues = [];
    var miniFilterUpperCase = this.miniFilter.toUpperCase();
    for (var i = 0, l = this.uniqueValues.length; i < l; i++) {
        var uniqueValue = this.uniqueValues[i];
        if (uniqueValue !== null && uniqueValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
            this.displayedValues.push(uniqueValue);
        }
    }

};

SetFilterModel.prototype.getDisplayedValueCount = function() {
    return this.displayedValues.length;
};

SetFilterModel.prototype.getDisplayedValue = function(index) {
    return this.displayedValues[index];
};

SetFilterModel.prototype.selectEverything = function() {
    var count = this.uniqueValues.length;
    for (var i = 0; i < count; i++) {
        var value = this.uniqueValues[i];
        this.selectedValuesMap[value] = null;
    }
    this.selectedValuesCount = count;
};

SetFilterModel.prototype.isFilterActive = function() {
    return this.uniqueValues.length !== this.selectedValuesCount;
};

SetFilterModel.prototype.selectNothing = function() {
    this.selectedValuesMap = {};
    this.selectedValuesCount = 0;
};

SetFilterModel.prototype.getUniqueValueCount = function() {
    return this.uniqueValues.length;
};

SetFilterModel.prototype.getUniqueValue = function(index) {
    return this.uniqueValues[index];
};

SetFilterModel.prototype.unselectValue = function(value) {
    if (this.selectedValuesMap[value] !== undefined) {
        delete this.selectedValuesMap[value];
        this.selectedValuesCount--;
    }
};

SetFilterModel.prototype.selectValue = function(value) {
    if (this.selectedValuesMap[value] === undefined) {
        this.selectedValuesMap[value] = null;
        this.selectedValuesCount++;
    }
};

SetFilterModel.prototype.isValueSelected = function(value) {
    return this.selectedValuesMap[value] !== undefined;
};

SetFilterModel.prototype.isEverythingSelected = function() {
    return this.uniqueValues.length === this.selectedValuesCount;
};

SetFilterModel.prototype.isNothingSelected = function() {
    return this.uniqueValues.length === 0;
};

SetFilterModel.prototype.getModel = function() {
    if (!this.isFilterActive()) {
        return null;
    }
    var selectedValues = [];
    utils.iterateObject(this.selectedValuesMap, function(key) {
        selectedValues.push(key);
    });
    return selectedValues;
};

SetFilterModel.prototype.setModel = function(model) {
    if (model) {
        this.selectNothing();
        for (var i = 0; i<model.length; i++) {
            var newValue = model[i];
            if (this.uniqueValues.indexOf(newValue)>=0) {
                this.selectValue(model[i]);
            } else {
                console.warn('Value ' + newValue + ' is not a valid value for filter');
            }
        }
    } else {
        this.selectEverything();
    }
};

module.exports = SetFilterModel;
