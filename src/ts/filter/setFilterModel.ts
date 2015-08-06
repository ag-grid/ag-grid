/// <reference path="../utils.ts" />

module awk.grid {

    var utils = Utils;

    export class SetFilterModel {

        selectedValuesMap: any;
        colDef: any;
        rowModel: any;
        valueGetter: any;
        displayedValues: any;
        uniqueValues: any;
        miniFilter: any;
        selectedValuesCount: any;

        constructor(colDef: any, rowModel: any, valueGetter: any) {
            this.colDef = colDef;
            this.rowModel = rowModel;
            this.valueGetter = valueGetter;

            this.createUniqueValues();

            // by default, no filter, so we display everything
            this.displayedValues = this.uniqueValues;
            this.miniFilter = null;
            //we use a map rather than an array for the selected values as the lookup
            //for a map is much faster than the lookup for an array, especially when
            //the length of the array is thousands of records long
            this.selectedValuesMap = {};
            this.selectEverything();
        }

        // if keepSelection not set will always select all filters
        // if keepSelection set will keep current state of selected filters
        //    unless selectAll chosen in which case will select all
        refreshUniqueValues(keepSelection: any, isSelectAll: boolean) {
            this.createUniqueValues();

            var oldModel = Object.keys(this.selectedValuesMap);

            this.selectedValuesMap = {};
            this.filterDisplayedValues();

            if (keepSelection) {
                this.setModel(oldModel, isSelectAll);
            } else {
                this.selectEverything();
            }
        }

        createUniqueValues() {
            if (this.colDef.filterParams && this.colDef.filterParams.values) {
                this.uniqueValues = utils.toStrings(this.colDef.filterParams.values);
            } else {
                this.uniqueValues = utils.toStrings(this.iterateThroughNodesForValues());
            }

            if (this.colDef.comparator) {
                this.uniqueValues.sort(this.colDef.comparator);
            } else {
                this.uniqueValues.sort(utils.defaultComparator);
            }
        }

        iterateThroughNodesForValues() {
            var uniqueCheck = <any>{};
            var result = <any>[];

            var that = this;

            function recursivelyProcess(nodes: any) {
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.group && !node.footer) {
                        // group node, so dig deeper
                        recursivelyProcess(node.children);
                    } else {
                        var value = that.valueGetter(node);
                        if (value === "" || value === undefined) {
                            value = null;
                        }

                        if (value != null && Array.isArray(value)) {
                            for (var j = 0; j < value.length; j++) {
                                addUniqueValueIfMissing(value[j])
                            }
                        } else {
                            addUniqueValueIfMissing(value)
                        }
                    }
                }
            }

            function addUniqueValueIfMissing(value: any) {
                if (!uniqueCheck.hasOwnProperty(value)) {
                    result.push(value);
                    uniqueCheck[value] = 1;
                }
            }

            var topLevelNodes = this.rowModel.getTopLevelNodes();
            recursivelyProcess(topLevelNodes);

            return result;
        }

//sets mini filter. returns true if it changed from last value, otherwise false
        setMiniFilter(newMiniFilter: any) {
            newMiniFilter = utils.makeNull(newMiniFilter);
            if (this.miniFilter === newMiniFilter) {
                //do nothing if filter has not changed
                return false;
            }
            this.miniFilter = newMiniFilter;
            this.filterDisplayedValues();
            return true;
        }

        getMiniFilter() {
            return this.miniFilter;
        }

        filterDisplayedValues() {
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
        }

        getDisplayedValueCount() {
            return this.displayedValues.length;
        }

        getDisplayedValue(index: any) {
            return this.displayedValues[index];
        }

        selectEverything() {
            var count = this.uniqueValues.length;
            for (var i = 0; i < count; i++) {
                var value = this.uniqueValues[i];
                this.selectedValuesMap[value] = null;
            }
            this.selectedValuesCount = count;
        }

        isFilterActive() {
            return this.uniqueValues.length !== this.selectedValuesCount;
        }

        selectNothing() {
            this.selectedValuesMap = {};
            this.selectedValuesCount = 0;
        }

        getUniqueValueCount() {
            return this.uniqueValues.length;
        }

        getUniqueValue(index: any) {
            return this.uniqueValues[index];
        }

        unselectValue(value: any) {
            if (this.selectedValuesMap[value] !== undefined) {
                delete this.selectedValuesMap[value];
                this.selectedValuesCount--;
            }
        }

        selectValue(value: any) {
            if (this.selectedValuesMap[value] === undefined) {
                this.selectedValuesMap[value] = null;
                this.selectedValuesCount++;
            }
        }

        isValueSelected(value: any) {
            return this.selectedValuesMap[value] !== undefined;
        }

        isEverythingSelected() {
            return this.uniqueValues.length === this.selectedValuesCount;
        }

        isNothingSelected() {
            return this.uniqueValues.length === 0;
        }

        getModel() {
            if (!this.isFilterActive()) {
                return null;
            }
            var selectedValues = <any>[];
            utils.iterateObject(this.selectedValuesMap, function (key: any) {
                selectedValues.push(key);
            });
            return selectedValues;
        }

        setModel(model: any, isSelectAll: boolean) {
            if (model && !isSelectAll) {
                this.selectNothing();
                for (var i = 0; i < model.length; i++) {
                    var newValue = model[i];
                    if (this.uniqueValues.indexOf(newValue) >= 0) {
                        this.selectValue(model[i]);
                    } else {
                        console.warn('Value ' + newValue + ' is not a valid value for filter');
                    }
                }
            } else {
                this.selectEverything();
            }
        }
    }
}
