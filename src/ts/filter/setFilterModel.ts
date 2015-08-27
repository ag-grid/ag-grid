/// <reference path="../utils.ts" />
/// <reference path="../entities/colDef.ts" />

module awk.grid {

    var utils = Utils;

    export class SetFilterModel {

        private selectedValuesMap: any;
        private colDef: ColDef;
        private rowModel: any;
        private valueGetter: any;
        private displayedValues: any;
        private filteredDisplayValues: any;
        private uniqueValues: any;
        private miniFilter: any;
        private selectedValuesCount: any;

        constructor(colDef: ColDef, rowModel: any, valueGetter: any) {
            this.colDef = colDef;
            this.rowModel = rowModel;
            this.valueGetter = valueGetter;

            this.createUniqueValues();

            // by default, no filter, so we display everything
            this.displayedValues = this.uniqueValues;
            this.filteredDisplayValues = this.uniqueValues;
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
        public refreshUniqueValues(keepSelection: any, isSelectAll: boolean) {
            this.createUniqueValues();
            this.filteredDisplayValues = this.uniqueValues;

            var oldModel = Object.keys(this.selectedValuesMap);

            this.selectedValuesMap = {};
            this.filterDisplayedValues();

            if (keepSelection) {
                this.setModel(oldModel, isSelectAll);
            } else {
                this.selectEverything();
            }
        }

        private createUniqueValues() {
            var filterParams = <SetFilterParameters> this.colDef.filterParams;
            if (this.colDef.filterParams && filterParams.values) {
                this.uniqueValues = utils.toStrings(filterParams.values);
            } else {
                this.uniqueValues = utils.toStrings(this.iterateThroughNodesForValues(this.rowModel.getTopLevelNodes()));
            }

            if (this.colDef.comparator) {
                this.uniqueValues.sort(this.colDef.comparator);
            } else {
                this.uniqueValues.sort(utils.defaultComparator);
            }
        }

    	public setFilteredDisplayValues(rows: any) {
            var values: any[] = this.iterateThroughNodesForValues(rows);
    	    this.filteredDisplayValues = utils.toStrings(values);
    	    this.filterDisplayedValues();
    	}

        private iterateThroughNodesForValues(topLevelNodes: any): any[] {
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

            recursivelyProcess(topLevelNodes);

            return result;
        }

        //sets mini filter. returns true if it changed from last value, otherwise false
        public setMiniFilter(newMiniFilter: any) {
            newMiniFilter = utils.makeNull(newMiniFilter);
            if (this.miniFilter === newMiniFilter) {
                //do nothing if filter has not changed
                return false;
            }
            this.miniFilter = newMiniFilter;
            this.filterDisplayedValues();
            return true;
        }

        public getMiniFilter() {
            return this.miniFilter;
        }

        private filterDisplayedValues() {
            // if no filter, just use the unique values
            if (this.miniFilter === null) {
                this.displayedValues = this.filteredDisplayValues;
                return;
            }

            // if filter present, we filter down the list
            this.displayedValues = [];
            var miniFilterUpperCase = this.miniFilter.toUpperCase();
            for (var i = 0, l = this.filteredDisplayValues.length; i < l; i++) {
                var filteredValue = this.filteredDisplayValues[i];
                if (filteredValue !== null && filteredValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                    this.displayedValues.push(filteredValue);
                }
            }
        }

        public getDisplayedValueCount() {
            return this.displayedValues.length;
        }

        public getDisplayedValue(index: any) {
            return this.displayedValues[index];
        }

        public selectEverything() {
            var count = this.uniqueValues.length;
            for (var i = 0; i < count; i++) {
                var value = this.uniqueValues[i];
                this.selectedValuesMap[value] = null;
            }
            this.selectedValuesCount = count;
        }

        public isFilterActive() {
            return this.uniqueValues.length !== this.selectedValuesCount;
        }

        public selectNothing() {
            this.selectedValuesMap = {};
            this.selectedValuesCount = 0;
        }

        public getUniqueValueCount() {
            return this.uniqueValues.length;
        }

        public getUniqueValue(index: any) {
            return this.uniqueValues[index];
        }

        public unselectValue(value: any) {
            if (this.selectedValuesMap[value] !== undefined) {
                delete this.selectedValuesMap[value];
                this.selectedValuesCount--;
            }
        }

        public selectValue(value: any) {
            if (this.selectedValuesMap[value] === undefined) {
                this.selectedValuesMap[value] = null;
                this.selectedValuesCount++;
            }
        }

        public isValueSelected(value: any) {
            return this.selectedValuesMap[value] !== undefined;
        }

        public isEverythingSelected() {
            return this.uniqueValues.length === this.selectedValuesCount;
        }

        public isNothingSelected() {
            return this.uniqueValues.length === 0;
        }

        public getModel() {
            if (!this.isFilterActive()) {
                return null;
            }
            var selectedValues = <any>[];
            utils.iterateObject(this.selectedValuesMap, function (key: any) {
                selectedValues.push(key);
            });
            return selectedValues;
        }

        public setModel(model: any, isSelectAll: boolean) {
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
