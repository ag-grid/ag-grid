import {Utils} from "ag-grid/main";
import {ColDef} from "ag-grid/main";
import {SetFilterParameters} from "ag-grid/main";

// we cannot have 'null' as a key in a JavaScript map,
// it needs to be a string. so we use this string for
// storing null values.
const NULL_VALUE = '___NULL___';

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
    private suppressSorting: boolean;

    // to make code more readable, we work these out once, and
    // then refer to each time. both are derived from the filterParams
    private showingAvailableOnly: boolean;
    private usingProvidedSet: boolean;

    private doesRowPassOtherFilters: any;

    constructor(colDef: ColDef, rowModel: any, valueGetter: any, doesRowPassOtherFilters: any, suppressSorting: boolean) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.rowModel = rowModel;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;

        this.filterParams = <SetFilterParameters> this.colDef.filterParams;
        if (Utils.exists(this.filterParams)) {
            this.usingProvidedSet = Utils.exists(this.filterParams.values);
            this.showingAvailableOnly = this.filterParams.suppressRemoveEntries!==true;
        } else {
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
            this.allUniqueValues = Utils.toStrings(this.filterParams.values);
        } else {
            var uniqueValuesAsAnyObjects = this.getUniqueValues(false);
            this.allUniqueValues = Utils.toStrings(uniqueValuesAsAnyObjects);
        }

        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    }

    private createAvailableUniqueValues() {
        var dontCheckAvailableValues = !this.showingAvailableOnly || this.usingProvidedSet;
        if (dontCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
            return;
        }

        var uniqueValuesAsAnyObjects = this.getUniqueValues(true);
        this.availableUniqueValues = Utils.toStrings(uniqueValuesAsAnyObjects);
        this.sortValues(this.availableUniqueValues);
    }

    private sortValues(values: any[]): void {
        if (this.filterParams && this.filterParams.comparator) {
            values.sort(this.filterParams.comparator);
        } else if (this.colDef.comparator) {
            values.sort(this.colDef.comparator);
        } else {
            values.sort(Utils.defaultComparator);
        }
    }

    private getUniqueValues(filterOutNotAvailable: boolean): any[] {
        var uniqueCheck = <any>{};
        var result = <any>[];

        if (!this.rowModel.forEachLeafNode) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        this.rowModel.forEachLeafNode( (node: any)=> {
            if (!node.group) {
                var value = this.valueGetter(node);

                if (this.colDef.keyCreator) {
                    value = this.colDef.keyCreator( {value: value} );
                }

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
        newMiniFilter = Utils.makeNull(newMiniFilter);
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
            var key = this.allUniqueValues[i];
            let safeKey = this.valueToKey(key);
            this.selectedValuesMap[safeKey] = null;
        }
        this.selectedValuesCount = count;
    }

    private valueToKey(key: string): string {
        if (key===null) {
            return NULL_VALUE;
        } else {
            return key;
        }
    }

    private keyToValue(value: string): string {
        if (value===NULL_VALUE) {
            return null;
        } else {
            return value;
        }
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
        let safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] !== undefined) {
            delete this.selectedValuesMap[safeKey];
            this.selectedValuesCount--;
        }
    }

    public selectValue(value: any) {
        let safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] === undefined) {
            this.selectedValuesMap[safeKey] = null;
            this.selectedValuesCount++;
        }
    }

    public isValueSelected(value: any) {
        let safeKey = this.valueToKey(value);
        return this.selectedValuesMap[safeKey] !== undefined;
    }

    public isEverythingSelected() {
        return this.allUniqueValues.length === this.selectedValuesCount;
    }

    public isNothingSelected() {
        return this.selectedValuesCount === 0;
    }

    public getModel() {
        if (!this.isFilterActive()) {
            return null;
        }
        var selectedValues = <any>[];
        Utils.iterateObject(this.selectedValuesMap, (key: string) => {
            let value = this.keyToValue(key);
            selectedValues.push(value);
        });
        return selectedValues;
    }

    public setModel(model: any, isSelectAll = false) {
        if (model && !isSelectAll) {
            this.selectNothing();
            for (var i = 0; i < model.length; i++) {
                var value = model[i];
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        } else {
            this.selectEverything();
        }
    }
}
