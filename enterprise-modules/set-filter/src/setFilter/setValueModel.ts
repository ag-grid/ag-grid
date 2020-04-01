import {
    IClientSideRowModel,
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
    IEventEmitter,
    _,
    EventService
} from '@ag-grid-community/core';

// We cannot use 'null' as a key in a JavaScript map, it needs to be a string, so we use this string for
// storing null values.
const NULL_VALUE = '___NULL___';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CB, NOT_PROVIDED
}

export class SetValueModel implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private colDef: ColDef;
    private filterParams: ISetFilterParams;

    private clientSideRowModel: IClientSideRowModel;
    private valueGetter: any;
    private allUniqueValues: (string | null)[]; // all values in the table
    private availableUniqueValues: (string | null)[]; // all values not filtered by other rows
    private availableUniqueValuesMap: { [value: string]: boolean; }; // same as availableUniqueValues but in a map, for quick lookup
    private displayedValues: any[]; // all values we are rendering on screen (i.e. after mini filter)
    private miniFilter: string | null;
    private selectedValuesCount: number;
    private selectedValuesMap: { [value: string]: any; };
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

    private localEventService = new EventService();

    constructor(
        colDef: ColDef,
        rowModel: IRowModel,
        valueGetter: any,
        doesRowPassOtherFilters: any,
        suppressSorting: boolean,
        modelUpdatedFunc: (values: string[] | null, selected?: string[] | null) => void,
        isLoadingFunc: (loading: boolean) => void,
        valueFormatterService: ValueFormatterService,
        column: Column
    ) {
        this.suppressSorting = suppressSorting;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
        this.doesRowPassOtherFilters = doesRowPassOtherFilters;
        this.modelUpdatedFunc = modelUpdatedFunc;
        this.isLoadingFunc = isLoadingFunc;
        this.valueFormatterService = valueFormatterService;
        this.column = column;

        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel as IClientSideRowModel;
        }

        this.filterParams = this.colDef.filterParams || {};

        if (_.exists(this.filterParams) && _.exists(this.filterParams.values)) {
            this.valuesType = Array.isArray(this.filterParams.values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CB;

            this.showingAvailableOnly = !this.filterParams.suppressRemoveEntries;
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
        this.selectNothing();
        this.selectAllUsingMiniFilter();
        this.formatter = this.filterParams.textFormatter ? this.filterParams.textFormatter : TextFilter.DEFAULT_FORMATTER;
    }

    public addEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.removeEventListener(eventType, listener, async);
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

        this.selectNothing();
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
        return this.valuesType === SetFilterModelValuesType.PROVIDED_LIST ||
            this.valuesType === SetFilterModelValuesType.NOT_PROVIDED;
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
        if (this.valuesType == SetFilterModelValuesType.PROVIDED_LIST) {
            if (Array.isArray(this.filterParams.values)) {
                return _.toStrings(this.filterParams.values);
            } else {
                // In this case the values are async but have already been resolved, so we can reuse them
                return this.allUniqueValues;
            }
        } else if (this.valuesType == SetFilterModelValuesType.PROVIDED_CB) {
            throw Error(`ag-grid: Error extracting values to use. We should not extract the values synchronously when using a callback for the filterParams.values`);
        } else {
            return _.toStrings(this.getUniqueValues(false));
        }
    }

    public isValueAvailable(value: string): boolean {
        return this.availableUniqueValuesMap[value];
    }

    private createAvailableUniqueValues() {
        const shouldNotCheckAvailableValues = !this.showingAvailableOnly ||
            this.valuesType == SetFilterModelValuesType.PROVIDED_LIST ||
            this.valuesType == SetFilterModelValuesType.PROVIDED_CB;

        if (shouldNotCheckAvailableValues) {
            this.availableUniqueValues = this.allUniqueValues;
        } else {
            this.availableUniqueValues = _.toStrings(this.getUniqueValues(true));
            this.sortValues(this.availableUniqueValues);
        }

        this.availableUniqueValuesMap = {};

        if (this.availableUniqueValues) {
            this.availableUniqueValues.forEach(value => this.availableUniqueValuesMap[value] = true);
        }

        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
    }

    private sortValues(values: any[]): void {
        let comparator: (a: any, b: any) => number;

        if (this.filterParams && this.filterParams.comparator) {
            comparator = this.filterParams.comparator;
        } else if (this.colDef.comparator) {
            comparator = this.colDef.comparator as (a: any, b: any) => number;
        } else {
            comparator = _.defaultComparator;
        }

        values.sort(comparator);
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
                value = this.colDef.keyCreator({ value });
            }

            value = _.makeNull(value);

            if (filterOutNotAvailable && !this.doesRowPassOtherFilters(node)) {
                return;
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

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    public setMiniFilter(newMiniFilter?: string): boolean {
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
        const matchesFn = (valueToCheck: string): boolean => {
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
                const formattedValue = this.valueFormatterService.formatValue(this.column, null, null, displayedValue);

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
        this.selectOn(this.miniFilter ? this.displayedValues : this.allUniqueValues);
    }

    private selectOn(toSelectOn: any[]) {
        const count = toSelectOn.length;

        for (let i = 0; i < count; i++) {
            const key = toSelectOn[i];
            const safeKey = this.convertNull(key);
            this.selectedValuesMap[safeKey] = null;
        }

        this.selectedValuesCount = Object.keys(this.selectedValuesMap).length;
    }

    private convertNull(key: string | null): string {
        return key === null ? NULL_VALUE : key;
    }

    public isFilterActive(): boolean {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    }

    public selectNothingUsingMiniFilter(): void {
        if (this.miniFilter) {
            this.displayedValues.forEach(it => this.unselectValue(it));
        } else {
            this.selectNothing();
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
        const safeKey = this.convertNull(value);

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
        const safeKey = this.convertNull(value);

        if (this.selectedValuesMap[safeKey] === undefined) {
            this.selectedValuesMap[safeKey] = null;
            this.selectedValuesCount++;
        }
    }

    public isValueSelected(value: any) {
        const safeKey = this.convertNull(value);

        return this.selectedValuesMap[safeKey] !== undefined;
    }

    public isEverythingSelected(): boolean {
        if (this.miniFilter) {
            return this.displayedValues.filter(it => this.isValueSelected(it)).length === this.displayedValues.length;
        } else {
            return this.allUniqueValues.length === this.selectedValuesCount;
        }
    }

    public isNothingSelected() {
        if (this.miniFilter) {
            return this.displayedValues.filter(it => this.isValueSelected(it)).length === 0;
        } else {
            return this.selectedValuesCount === 0;
        }
    }

    public getModel(): string[] | null {
        if (!this.isFilterActive()) {
            return null;
        }

        return Object.keys(this.selectedValuesMap).map(key => this.convertNull(key));
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

            model
                .map(value => this.convertNull(value))
                .filter(value => this.allUniqueValues.indexOf(value) >= 0)
                .forEach(value => this.selectValue(value));
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
