import {
    ClientSideRowModel,
    ColDef,
    Column,
    Constants,
    ExternalPromise,
    IRowModel,
    ISetFilterParams,
    Promise,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
    TextFilter,
    TextFormatter,
    ValueFormatterService,
    _
} from "ag-grid-community";

// we cannot have 'null' as a key in a JavaScript map,
// it needs to be a string. so we use this string for
// storing null values.
const NULL_VALUE = '___NULL___';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CB, NOT_PROVIDED
}

export class SetValueModel {

    private colDef: ColDef;
    private filterParams: ISetFilterParams;

    private clientSideRowModel: ClientSideRowModel;
    private valueGetter: any;
    private allUniqueValues: (string | null)[]; // all values in the table
    private availableUniqueValues: (string | null)[]; // all values not filtered by other rows
    private displayedValues: any[]; // all values we are rendering on screen (ie after mini filter)
    private miniFilter: string | null;
    private selectedValuesCount: number;
    private selectedValuesMap: { [value: string]: any };
    private suppressSorting: boolean;
    private formatter: TextFormatter;

    // to make code more readable, we work these out once, and
    // then refer to each time. both are derived from the filterParams
    private showingAvailableOnly: boolean;
    private valuesType: SetFilterModelValuesType;

    private doesRowPassOtherFilters: any;
    private modelUpdatedFunc: (values: string[] | null, selected?: string[] | null) => void;
    private isLoadingFunc: (loading: boolean) => void;

    private filterValuesExternalPromise: ExternalPromise<string[]>;
    private filterValuesPromise: Promise<string[]>;

    private valueFormatterService: ValueFormatterService;
    private column: Column;

    constructor(colDef: ColDef,
                rowModel: IRowModel,
                valueGetter: any,
                doesRowPassOtherFilters: any,
                suppressSorting: boolean,
                modelUpdatedFunc: (values: string[] | null, selected?: string[] | null) => void,
                isLoadingFunc: (loading: boolean) => void,
                valueFormatterService: ValueFormatterService,
                column: Column) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.modelUpdatedFunc = modelUpdatedFunc;
        this.isLoadingFunc = isLoadingFunc;
        this.valueFormatterService = valueFormatterService;
        this.column = column;

        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel as ClientSideRowModel;
        }

        this.filterParams = this.colDef.filterParams ? this.colDef.filterParams as ISetFilterParams : {} as ISetFilterParams;
        if (_.exists(this.filterParams) && _.exists(this.filterParams.values)) {
            this.valuesType = Array.isArray(this.filterParams.values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CB;
            this.showingAvailableOnly = this.filterParams.suppressRemoveEntries !== true;
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
        this.selectAllUsingMiniFilter();
        this.formatter = this.filterParams.textFormatter ? this.filterParams.textFormatter : TextFilter.DEFAULT_FORMATTER;
    }

    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    public refreshAfterNewRowsLoaded(keepSelection: any, everythingSelected: boolean) {
        this.createAllUniqueValues();
        this.refreshSelection(keepSelection, everythingSelected);
    }

    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    public refreshValues(valuesToUse: string[], keepSelection: any, isSelectAll: boolean) {
        this.setValues(valuesToUse);
        this.refreshSelection(keepSelection, isSelectAll);
    }

    private refreshSelection(keepSelection: any, isSelectAll: boolean) {
        this.createAvailableUniqueValues();

        const oldModel = Object.keys(this.selectedValuesMap);

        this.selectedValuesMap = {};
        this.processMiniFilter();

        if (keepSelection) {
            this.setModel(oldModel, isSelectAll);
        } else {
            this.selectAllUsingMiniFilter();
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
            const valuesToUse: (string | null)[] = this.extractSyncValuesToUse();
            this.setValues(valuesToUse);
            this.filterValuesPromise = Promise.resolve([]);
        } else {
            this.filterValuesExternalPromise = Promise.external<string[]>();
            this.filterValuesPromise = this.filterValuesExternalPromise.promise;
            this.isLoadingFunc(true);
            this.setValues([]);
            const callback = this.filterParams.values as SetFilterValuesFunc;
            const params: SetFilterValuesFuncParams = {
                success: this.onAsyncValuesLoaded.bind(this),
                colDef: this.colDef
            };

            window.setTimeout(() => callback(params), 0);
        }
    }

    private onAsyncValuesLoaded(values: string[]): void {
        this.modelUpdatedFunc(values);
        this.isLoadingFunc(false);
        this.filterValuesExternalPromise.resolve(values);
    }

    private areValuesSync() {
        return this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.NOT_PROVIDED;
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    private setValues(valuesToUse: (string | null)[]) {
        this.allUniqueValues = valuesToUse;
        if (!this.suppressSorting) {
            this.sortValues(this.allUniqueValues);
        }
    }

    private extractSyncValuesToUse() {
        let valuesToUse: (string | null)[];
        if (this.valuesType == SetFilterModelValuesType.PROVIDED_LIST) {
            if (Array.isArray(this.filterParams.values)) {
                valuesToUse = _.toStrings(this.filterParams.values as string[]);
            } else {
                // In this case the values are async but have already been resolved, so we can reuse them
                valuesToUse = this.allUniqueValues;
            }
        } else if (this.valuesType == SetFilterModelValuesType.PROVIDED_CB) {
            throw Error(`ag-grid: Error extracting values to use. We should not extract the values synchronously when using a callback for the filterParams.values`);
        } else {
            const uniqueValuesAsAnyObjects = this.getUniqueValues(false);
            valuesToUse = _.toStrings(uniqueValuesAsAnyObjects);
        }
        return valuesToUse;
    }

    private createAvailableUniqueValues() {
        const dontCheckAvailableValues = !this.showingAvailableOnly || this.valuesType == SetFilterModelValuesType.PROVIDED_LIST || this.valuesType == SetFilterModelValuesType.PROVIDED_CB;
        if (dontCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
            return;
        }

        const uniqueValuesAsAnyObjects = this.getUniqueValues(true);
        this.availableUniqueValues = _.toStrings(uniqueValuesAsAnyObjects);
        this.sortValues(this.availableUniqueValues);
    }

    private sortValues(values: any[]): void {
        if (this.filterParams && this.filterParams.comparator) {
            values.sort(this.filterParams.comparator);
        } else if (this.colDef.comparator) {
            values.sort(this.colDef.comparator as (a: any, b: any) => number);
        } else {
            values.sort(_.defaultComparator);
        }
    }

    private getUniqueValues(filterOutNotAvailable: boolean): any[] {
        const uniqueCheck = {} as any;
        const result = [] as any;

        if (!this.clientSideRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        this.clientSideRowModel.forEachLeafNode((node: any) => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data) {
                return;
            }

            let value = this.valueGetter(node);

            if (this.colDef.keyCreator) {
                value = this.colDef.keyCreator({value: value});
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
                    addUniqueValueIfMissing(value[j]);
                }
            } else {
                addUniqueValueIfMissing(value);
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
    public setMiniFilter(newMiniFilter: string | null): boolean {
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
        const miniFilter = this.formatter(this.miniFilter);

        // make upper case to have search case insensitive
        const miniFilterUpperCase = miniFilter.toUpperCase();

        //This function encapsulates the logic to check if a string matches the mini filter
        const matchesFn: any = (valueToCheck: string): boolean => {
            if (valueToCheck == null) {
                return false;
            }
            // allow for case insensitive searches, make both filter and value uppercase
            const valueUpperCase = valueToCheck.toUpperCase();

            return valueUpperCase.indexOf(miniFilterUpperCase) >= 0;
        };

        for (let i = 0, l = this.availableUniqueValues.length; i < l; i++) {
            const value = this.availableUniqueValues[i];
            if (value) {
                const displayedValue = this.formatter(value.toString());

                const formattedValue: string =
                    this.valueFormatterService.formatValue(this.column, null, null, displayedValue);

                if (matchesFn(displayedValue) || matchesFn(formattedValue)) {
                    this.displayedValues.push(value);
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

    public selectAllUsingMiniFilter() {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectOn(this.allUniqueValues);
        } else {
            this.selectOn(this.displayedValues);
        }
    }

    private selectOn(toSelectOn: any[]) {
        const count = toSelectOn.length;
        for (let i = 0; i < count; i++) {
            const key = toSelectOn[i];
            const safeKey = this.valueToKey(key);
            this.selectedValuesMap[safeKey] = null;
        }
        this.selectedValuesCount = Object.keys(this.selectedValuesMap).length;
    }

    private valueToKey(key: string): string {
        if (key === null) {
            return NULL_VALUE;
        } else {
            return key;
        }
    }

    private keyToValue(value: string): string | null {
        if (value === NULL_VALUE) {
            return null;
        } else {
            return value;
        }
    }

    public isFilterActive(): boolean {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    }

    public selectNothingUsingMiniFilter(): void {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            this.selectNothing();
        } else {
            this.displayedValues.forEach(it => this.unselectValue(it));
        }
    }

    private selectNothing(): void {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    }

    public getUniqueValueCount(): number {
        return this.allUniqueValues.length;
    }

    public getUniqueValue(index: any): string | null {
        return this.allUniqueValues[index];
    }

    public unselectValue(value: any) {
        const safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] !== undefined) {
            delete this.selectedValuesMap[safeKey];
            this.selectedValuesCount--;
        }
    }

    public selectAllFromMiniFilter(): void {
        this.selectNothing();
        this.selectAllUsingMiniFilter();
    }

    public selectValue(value: any) {
        const safeKey = this.valueToKey(value);
        if (this.selectedValuesMap[safeKey] === undefined) {
            this.selectedValuesMap[safeKey] = null;
            this.selectedValuesCount++;
        }
    }

    public isValueSelected(value: any) {
        const safeKey = this.valueToKey(value);
        return this.selectedValuesMap[safeKey] !== undefined;
    }

    public isEverythingSelected(): boolean {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.allUniqueValues.length === this.selectedValuesCount;
        } else {
            return this.displayedValues.filter(it => this.isValueSelected(it)).length === this.displayedValues.length;
        }
    }

    public isNothingSelected() {
        if (!this.filterParams.selectAllOnMiniFilter || !this.miniFilter) {
            return this.selectedValuesCount === 0;
        } else {
            return this.displayedValues.filter(it => this.isValueSelected(it)).length === 0;
        }
    }

    public getModel(): string[] | null {
        if (!this.isFilterActive()) {
            return null;
        }
        const selectedValues: any[] = [];
        _.iterateObject(this.selectedValuesMap, (key: string) => {
            const value = this.keyToValue(key);
            selectedValues.push(value);
        });
        return selectedValues;
    }

    public setModel(model: string[] | null, isSelectAll = false): void {
        if (this.areValuesSync()) {
            this.setSyncModel(model, isSelectAll);
        } else {
            this.filterValuesExternalPromise.promise.then(values => {
                this.setSyncModel(model, isSelectAll);
                this.modelUpdatedFunc(values, model);
            });
        }
    }

    private setSyncModel(model: string[] | null, isSelectAll = false): void {
        if (model && !isSelectAll) {
            this.selectNothingUsingMiniFilter();
            for (let i = 0; i < model.length; i++) {
                const rawValue = model[i];
                const value = this.keyToValue(rawValue);
                if (this.allUniqueValues.indexOf(value) >= 0) {
                    this.selectValue(value);
                }
            }
        } else {
            this.selectAllUsingMiniFilter();
        }
    }

    public onFilterValuesReady(callback: () => void): void {
        //This guarantees that if the user is racing to set values async into the set filter, only the first instance
        //will be used
        // ie Values are async and the user manually wants to override them before the retrieval of values is triggered
        // (set filter values in the following example)
        // http://plnkr.co/edit/eFka7ynvPj68tL3VJFWf?p=preview
        this.filterValuesPromise.firstOneOnly(callback);
    }
}
