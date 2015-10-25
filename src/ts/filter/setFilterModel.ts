/// <reference path="../utils.ts" />
/// <reference path="../entities/colDef.ts" />

module ag.grid {

    var _ = Utils;

    export class SetFilterModel {

        private colDef: ColDef;
        private filterParams: SetFilterParameters;

        private rowModel: any;
        private valueGetter: any;
        private allUniqueValues: any[]; // all values in the table
        private availableUniqueValues: any[]; // all values not filtered by other rows
        private displayedValues: any[]; // all values we are rendering on screen (ie after mini filter)
        private miniFilter: any;
        private selectedValuesCount: any;
        private selectedValuesMap: any;

        // so make code more readable, we work these out once, and
        // then refer to each time. both are derived from the filterParams
        private showingAvailableOnly: boolean;
        private usingProvidedSet: boolean;

        private doesRowPassOtherFilters: any;

        constructor(colDef: ColDef, rowModel: any, valueGetter: any, doesRowPassOtherFilters: any) {
            this.colDef = colDef;
            this.rowModel = rowModel;
            this.valueGetter = valueGetter;
            this.doesRowPassOtherFilters = doesRowPassOtherFilters;

            this.filterParams = <SetFilterParameters> this.colDef.filterParams;
            this.usingProvidedSet = this.filterParams && this.filterParams.values;
            this.showingAvailableOnly = this.filterParams && !this.filterParams.suppressRemoveEntries;

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
        public refreshAfterNewRowsLoaded(keepSelection: any, isSelectAll: boolean) {
            this.createAllUniqueValues();
            this.createAvailableUniqueValues();

            var oldModel = Object.keys(this.selectedValuesMap);

            this.selectedValuesMap = {};
            this.processMiniFilter();

            if (keepSelection) {
                this.setModel(oldModel, isSelectAll);
            } else {
                this.selectEverything();
            }
        }

        public refreshAfterAnyFilterChanged() {
            if (this.showingAvailableOnly) {
                this.createAvailableUniqueValues();
                this.processMiniFilter();
            }
        }

        private createAllUniqueValues() {
            if (this.usingProvidedSet) {
                this.allUniqueValues = _.toStrings(this.filterParams.values);
            } else {
                this.allUniqueValues = _.toStrings(this.getUniqueValues(false));
            }

            this.sortValues(this.allUniqueValues);
        }

        private createAvailableUniqueValues() {
            var dontCheckAvailableValues = !this.showingAvailableOnly || this.usingProvidedSet;
            if (dontCheckAvailableValues) {
                this.availableUniqueValues = this.allUniqueValues;
                return;
            }

            this.availableUniqueValues = _.toStrings(this.getUniqueValues(true));
            this.sortValues(this.availableUniqueValues);
        }

        private sortValues(values: any[]): void {
            if (this.filterParams && this.filterParams.comparator) {
                values.sort(this.filterParams.comparator);
            } else if (this.colDef.comparator) {
                values.sort(this.colDef.comparator);
            } else {
                values.sort(_.defaultComparator);
            }
        }

        private getUniqueValues(filterOutNotAvailable: boolean): any[] {
            var uniqueCheck = <any>{};
            var result = <any>[];

            this.rowModel.forEachNode( (node: any)=> {
                if (!node.group) {
                    var value = this.valueGetter(node);
                    if (value === "" || value === undefined) {
                        value = null;
                    }

                    if (filterOutNotAvailable) {
                        if (!this.doesRowPassOtherFilters(node)) {
                            return;
                        }
                    }

                    if (value != null && Array.isArray(value)) {
                        for (var j = 0; j < value.length; j++) {
                            addUniqueValueIfMissing(value[j])
                        }
                    } else {
                        addUniqueValueIfMissing(value)
                    }
                }
            });

            function addUniqueValueIfMissing(value: any) {
                if (!uniqueCheck.hasOwnProperty(value)) {
                    result.push(value);
                    uniqueCheck[value] = 1;
                }
            }

            return result;
        }

        //sets mini filter. returns true if it changed from last value, otherwise false
        public setMiniFilter(newMiniFilter: any) {
            newMiniFilter = _.makeNull(newMiniFilter);
            if (this.miniFilter === newMiniFilter) {
                //do nothing if filter has not changed
                return false;
            }
            this.miniFilter = newMiniFilter;
            this.processMiniFilter();
            return true;
        }

        public getMiniFilter() {
            return this.miniFilter;
        }

        private processMiniFilter() {
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
        }

        public getDisplayedValueCount() {
            return this.displayedValues.length;
        }

        public getDisplayedValue(index: any) {
            return this.displayedValues[index];
        }

        public selectEverything() {
            var count = this.allUniqueValues.length;
            for (var i = 0; i < count; i++) {
                var value = this.allUniqueValues[i];
                this.selectedValuesMap[value] = null;
            }
            this.selectedValuesCount = count;
        }

        public isFilterActive() {
            return this.allUniqueValues.length !== this.selectedValuesCount;
        }

        public selectNothing() {
            this.selectedValuesMap = {};
            this.selectedValuesCount = 0;
        }

        public getUniqueValueCount() {
            return this.allUniqueValues.length;
        }

        public getUniqueValue(index: any) {
            return this.allUniqueValues[index];
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
            return this.allUniqueValues.length === this.selectedValuesCount;
        }

        public isNothingSelected() {
            return this.allUniqueValues.length === 0;
        }

        public getModel() {
            if (!this.isFilterActive()) {
                return null;
            }
            var selectedValues = <any>[];
            _.iterateObject(this.selectedValuesMap, function (key: any) {
                selectedValues.push(key);
            });
            return selectedValues;
        }

        public setModel(model: any, isSelectAll: boolean) {
            if (model && !isSelectAll) {
                this.selectNothing();
                for (var i = 0; i < model.length; i++) {
                    var newValue = model[i];
                    if (this.allUniqueValues.indexOf(newValue) >= 0) {
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
