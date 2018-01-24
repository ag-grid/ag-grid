import {Utils} from "ag-grid/main";
import {ColDef} from "ag-grid/main";
import {ISetFilterParams} from "ag-grid/main";
import {TextFormatter} from "ag-grid/main";
import {TextFilter} from "ag-grid/main";
import {InMemoryRowModel, IRowModel, Constants} from 'ag-grid';
import {SetFilterValuesFunc, SetFilterValuesFuncParams} from "ag-grid/main";
import {ExternalPromise, Promise} from 'ag-grid';

// we cannot have 'null' as a key in a JavaScript map,
// it needs to be a string. so we use this string for
// storing null values.
const NULL_VALUE = '___NULL___';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CB, NOT_PROVIDED
}

export class SetFilterModel {

    private colDef: ColDef;
    private filterParams: ISetFilterParams;

    private inMemoryRowModel: InMemoryRowModel;
    private valueGetter: any;
    private allUniqueValues: string[]; // all values in the table
    private availableUniqueValues: string[]; // all values not filtered by other rows
    private displayedValues: any[]; // all values we are rendering on screen (ie after mini filter)
    private miniFilter: string;
    private selectedValuesCount: number;
    private selectedValuesMap: {[value: string]: any};
    private suppressSorting: boolean;
    private formatter: TextFormatter;

    // to make code more readable, we work these out once, and
    // then refer to each time. both are derived from the filterParams
    private showingAvailableOnly: boolean;
    private valuesType: SetFilterModelValuesType;

    private doesRowPassOtherFilters: any;
    private modelUpdatedFunc: (values: string[]) => void;
    private isLoadingFunc: (loading: boolean) => void;

    private filterValuesExternalPromise: ExternalPromise<void>;
    private filterValuesPromise: Promise<void>;

    constructor(
        colDef: ColDef,
        rowModel: IRowModel,
        valueGetter: any,
        doesRowPassOtherFilters: any,
        suppressSorting: boolean,
        modelUpdatedFunc: (values:string[])=>void,
        isLoadingFunc: (loading:boolean)=>void
    ) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.modelUpdatedFunc = modelUpdatedFunc;
        this.isLoadingFunc = isLoadingFunc;

        if (rowModel.getType()===Constants.ROW_MODEL_TYPE_IN_MEMORY) {
            this.inMemoryRowModel = <InMemoryRowModel> rowModel;
        }

        this.filterParams = this.colDef.filterParams ? <ISetFilterParams> this.colDef.filterParams : <ISetFilterParams>{};
        if (Utils.exists(this.filterParams) && Utils.exists(this.filterParams.values)) {
            this.valuesType =  Array.isArray(this.filterParams.values)?
                                        SetFilterModelValuesType.PROVIDED_LIST :
                                        SetFilterModelValuesType.PROVIDED_CB;
            this.showingAvailableOnly = this.filterParams.suppressRemoveEntries!==true;
        } else {
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
        this.formatter = this.filterParams.textFormatter ? this.filterParams.textFormatter : TextFilter.DEFAULT_FORMATTER;
    }


    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    public refreshAfterNewRowsLoaded(keepSelection: any, isSelectAll: boolean) {
        this.createAllUniqueValues();
        this.refreshSelection(keepSelection, isSelectAll);
    }

    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    public refreshValues(valuesToUse:string[], keepSelection: any, isSelectAll: boolean) {
        this.setValues(valuesToUse);
        this.refreshSelection(keepSelection, isSelectAll);
    }

    private refreshSelection(keepSelection: any, isSelectAll: boolean) {
        this.createAvailableUniqueValues();

        let oldModel = Object.keys(this.selectedValuesMap);

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
        if (this.areValuesSync()) {
            let valuesToUse: string[] = this.extractSyncValuesToUse();
            this.setValues(valuesToUse);
            this.filterValuesPromise = Promise.resolve(null);
        } else {
            this.filterValuesExternalPromise = Promise.external<void>();
            this.filterValuesPromise = this.filterValuesExternalPromise.promise;
            this.isLoadingFunc(true);
            this.setValues([]);
            let callback = <SetFilterValuesFunc> this.filterParams.values;
            let params: SetFilterValuesFuncParams = {
                success:this.onAsyncValuesLoaded.bind(this)
            };
            callback(params);
        }
    }

    private onAsyncValuesLoaded(values:string[]): void {
        this.modelUpdatedFunc(values);
        this.isLoadingFunc(false);
        this.filterValuesExternalPromise.resolve(null);
    }

    private areValuesSync() {
        return this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.NOT_PROVIDED;
    }

    public setValuesType(value:SetFilterModelValuesType){
        this.valuesType = value;
    }

    private setValues(valuesToUse: string[]) {
        this.allUniqueValues = valuesToUse;
        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    }

    private extractSyncValuesToUse() {
        let valuesToUse: string[];
        if (this.valuesType == SetFilterModelValuesType.PROVIDED_LIST) {
            if(Array.isArray(this.filterParams.values)){
                valuesToUse = Utils.toStrings(<string[]>this.filterParams.values);
            } else {
                // In this case the values are async but have already been resolved, so we can reuse them
                valuesToUse = this.allUniqueValues;
            }
        } else if (this.valuesType == SetFilterModelValuesType.PROVIDED_CB){
            throw Error (`ag-grid: Error extracting values to use. We should not extract the values synchronously when using a callback for the filterParams.values`);
        } else {
            let uniqueValuesAsAnyObjects = this.getUniqueValues(false);
            valuesToUse = Utils.toStrings(uniqueValuesAsAnyObjects);
        }
        return valuesToUse;
    }

    private createAvailableUniqueValues() {
        let dontCheckAvailableValues = !this.showingAvailableOnly || this.valuesType == SetFilterModelValuesType.PROVIDED_LIST  || this.valuesType == SetFilterModelValuesType.PROVIDED_CB;
        if (dontCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
            return;
        }

        let uniqueValuesAsAnyObjects = this.getUniqueValues(true);
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
        let uniqueCheck = <any>{};
        let result = <any>[];

        if (!this.inMemoryRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        this.inMemoryRowModel.forEachLeafNode( (node: any)=> {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data) { return; }

            let value = this.valueGetter(node);

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
                for (let j = 0; j < value.length; j++) {
                    addUniqueValueIfMissing(value[j])
                }
            } else {
                addUniqueValueIfMissing(value)
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
    public setMiniFilter(newMiniFilter: string): boolean {
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
        const miniFilter = this.formatter(this.miniFilter);

        // make upper case to have search case insensitive
        const miniFilterUpperCase = miniFilter.toUpperCase();

        for (let i = 0, l = this.availableUniqueValues.length; i < l; i++) {
            let filteredValue = this.availableUniqueValues[i];
            if (filteredValue){
                const value = this.formatter(filteredValue.toString());

                if (value !== null) {

                    // allow for case insensitive searches, make both filter and value uppercase
                    const valueUpperCase = value.toUpperCase();

                    if (valueUpperCase.indexOf(miniFilterUpperCase) >= 0) {
                        this.displayedValues.push(filteredValue);
                    }

                }

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
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter){
            this.selectOn(this.allUniqueValues);
        } else {
            this.selectOn(this.displayedValues);
        }
    }

    private selectOn(toSelectOn: any[]) {
        let count = toSelectOn.length;
        for (let i = 0; i < count; i++) {
            let key = toSelectOn[i];
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

    public isFilterActive(): boolean {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    }

    public selectNothing(): void {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter){
            this.selectedValuesMap = {};
            this.selectedValuesCount = 0;
        }else {
            this.displayedValues.forEach(it=>this.unselectValue(it));
        }
    }

    public getUniqueValueCount(): number {
        return this.allUniqueValues.length;
    }

    public getUniqueValue(index: any): string {
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

    public isEverythingSelected(): boolean {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter){
            return this.allUniqueValues.length === this.selectedValuesCount;
        } else {
            return this.displayedValues.filter(it=>this.isValueSelected(it)).length === this.displayedValues.length;
        }
    }

    public isNothingSelected() {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter){
            return this.selectedValuesCount === 0;
        }else {
            return this.displayedValues.filter(it=>this.isValueSelected(it)).length === 0;
        }
    }

    public getModel():string[] {
        if (!this.isFilterActive()) {
            return null;
        }
        let selectedValues:string[] = [];
        Utils.iterateObject(this.selectedValuesMap, (key: string) => {
            let value = this.keyToValue(key);
            selectedValues.push(value);
        });
        return selectedValues;
    }

    public setModel(model: string[], isSelectAll = false): void {
        if (model && !isSelectAll) {
            this.selectNothing();
            for (let i = 0; i < model.length; i++) {
                let rawValue = model[i];
                let value = this.keyToValue(rawValue);
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        } else {
            this.selectEverything();
        }
    }

    public onFilterValuesReady (callback:()=>void):void{
        //This guarantees that if the user is racing to set values async into the set filter, only the first instance
        //will be used
        // ie Values are async and the user manually wants to override them before the retrieval of values is triggered
        // (set filter values in the following example)
        // http://plnkr.co/edit/eFka7ynvPj68tL3VJFWf?p=preview
        this.filterValuesPromise.firstOneOnly(callback)
    }
}
