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
    EventService,
    RowNode
} from '@ag-grid-community/core';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CALLBACK, TAKEN_FROM_GRID_VALUES
}

export class SetValueModel implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private filterParams: ISetFilterParams;
    private clientSideRowModel: IClientSideRowModel;

    /** All possible values for the filter */
    private allValues: string[];

    /** All values that are currently displayed, after the mini-filter has been applied */
    private displayedValues: string[];

    /** Remaining values when filters from other columns have been applied */
    private filteredValues: Set<string>;

    /** Values that have been selected for this filter */
    private selectedValues = new Set<string>();

    private miniFilter?: string;
    private formatter: TextFormatter;

    // to make code more readable, we work these out once, and
    // then refer to each time. both are derived from the filterParams
    private showingAvailableOnly = false;
    private valuesType: SetFilterModelValuesType;

    private filterValuesExternalPromise: ExternalPromise<string[]>;
    private filterValuesPromise: Promise<string[]>;

    private localEventService = new EventService();

    constructor(
        private readonly colDef: ColDef,
        rowModel: IRowModel,
        private readonly valueGetter: (node: RowNode) => any,
        private readonly doesRowPassOtherFilters: (node: RowNode) => boolean,
        private readonly suppressSorting: boolean,
        private readonly modelUpdatedFunc: (values: string[], selected?: string[]) => void,
        private readonly isLoadingFunc: (loading: boolean) => void,
        private readonly valueFormatterService: ValueFormatterService,
        private readonly column: Column
    ) {
        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel as IClientSideRowModel;
        }

        this.filterParams = this.colDef.filterParams || {};

        const { values } = this.filterParams;

        if (values != null) {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;
        } else {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
            this.showingAvailableOnly = !this.filterParams.suppressRemoveEntries;
        }

        this.updateAllValues();
        this.updateFilteredValues();

        // by default, no filter, so we display everything
        this.displayedValues = _.values(this.filteredValues);
        this.miniFilter = null;

        // we use a map rather than an array for the selected values as the lookup
        // for a map is much faster than the lookup for an array, especially when
        // the length of the array is thousands of records long
        this.selectNothing();
        this.selectAllUsingMiniFilter();
        this.formatter = this.filterParams.textFormatter || TextFilter.DEFAULT_FORMATTER;
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
    public refreshAfterNewRowsLoaded(keepSelection: boolean, everythingSelected: boolean): void {
        this.updateAllValues();
        this.refreshSelection(keepSelection, everythingSelected);
    }

    // if keepSelection not set will always select all filters
    // if keepSelection set will keep current state of selected filters
    //    unless selectAll chosen in which case will select all
    public refreshValues(valuesToUse: string[], keepSelection: boolean, isSelectAll: boolean): void {
        this.setValues(valuesToUse);
        this.refreshSelection(keepSelection, isSelectAll);
    }

    private refreshSelection(keepSelection: boolean, isSelectAll: boolean): void {
        this.updateFilteredValues();

        const oldModel = _.values(this.selectedValues);

        this.selectNothing();
        this.processMiniFilter();

        if (keepSelection) {
            this.setModel(oldModel, isSelectAll);
        } else {
            this.selectAllUsingMiniFilter();
        }
    }

    public refreshAfterAnyFilterChanged(): void {
        if (this.showingAvailableOnly) {
            this.updateFilteredValues();
            this.processMiniFilter();
        }
    }

    private updateAllValues(): void {
        if (this.areValuesSync()) {
            const valuesToUse = this.extractSyncValuesToUse();
            this.setValues(valuesToUse);
            this.filterValuesPromise = Promise.resolve([]);
        } else {
            this.filterValuesExternalPromise = Promise.external<string[]>();
            this.filterValuesPromise = this.filterValuesExternalPromise.promise;
            this.isLoadingFunc(true);
            this.setValues([]);

            const callback = this.filterParams.values as SetFilterValuesFunc;
            const params: SetFilterValuesFuncParams = {
                success: values => this.onAsyncValuesLoaded(values),
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

    private areValuesSync(): boolean {
        return this.valuesType === SetFilterModelValuesType.PROVIDED_LIST ||
            this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    private setValues(values: string[]): void {
        this.allValues = this.suppressSorting ? values : this.sortValues(values);
    }

    private extractSyncValuesToUse(): string[] {
        if (this.valuesType === SetFilterModelValuesType.PROVIDED_LIST) {
            if (Array.isArray(this.filterParams.values)) {
                return _.toStrings(this.filterParams.values);
            } else {
                // In this case the values are async but have already been resolved, so we can reuse them
                return this.allValues;
            }
        } else if (this.valuesType == SetFilterModelValuesType.PROVIDED_CALLBACK) {
            throw Error(`ag-grid: Error extracting values to use. We should not extract the values synchronously when using a callback for the filterParams.values`);
        } else {
            return this.getUniqueValues(false);
        }
    }

    public isValueAvailable(value: string): boolean {
        return this.filteredValues.has(value);
    }

    private updateFilteredValues(): void {
        const shouldNotCheckAvailableValues = !this.showingAvailableOnly ||
            this.valuesType === SetFilterModelValuesType.PROVIDED_LIST ||
            this.valuesType === SetFilterModelValuesType.PROVIDED_CALLBACK;

        const filteredValues = shouldNotCheckAvailableValues ?
            this.allValues :
            this.sortValues(this.getUniqueValues(true));

        this.filteredValues = _.convertToSet(filteredValues);

        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
    }

    private sortValues(values: string[]): string[] {
        let comparator = _.defaultComparator;

        if (this.filterParams && this.filterParams.comparator) {
            comparator = this.filterParams.comparator;
        } else if (this.colDef.comparator) {
            comparator = this.colDef.comparator as (a: any, b: any) => number;
        }

        return values.sort(comparator);
    }

    private getUniqueValues(filterOutUnavailableValues: boolean): string[] {
        if (!this.clientSideRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        const values = new Set<string>();

        this.clientSideRowModel.forEachLeafNode((node: RowNode) => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || (filterOutUnavailableValues && !this.doesRowPassOtherFilters(node))) {
                return;
            }

            let value = this.valueGetter(node);

            if (this.colDef.keyCreator) {
                value = this.colDef.keyCreator({ value });
            }

            value = _.makeNull(value);

            if (value != null && Array.isArray(value)) {
                _.forEach(value, x => {
                    const formatted = _.toStringOrNull(_.makeNull(x));
                    values.add(formatted);
                });
            } else {
                values.add(_.toStringOrNull(value));
            }
        });

        return _.values(values);
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

    public getMiniFilter(): string {
        return this.miniFilter;
    }

    private processMiniFilter(): void {
        // if no filter, just use the unique values
        if (this.miniFilter == null) {
            this.displayedValues = _.values(this.filteredValues);
            return;
        }

        // if filter present, we filter down the list
        this.displayedValues = [];
        const miniFilter = this.formatter(this.miniFilter);

        // make upper case to have search case insensitive
        const miniFilterUpperCase = miniFilter.toUpperCase();

        const matchesFilter = (valueToCheck: string): boolean => {
            // allow for case insensitive searches, make both filter and value uppercase
            return valueToCheck != null && valueToCheck.toUpperCase().indexOf(miniFilterUpperCase) >= 0;
        };

        this.filteredValues.forEach(value => {
            if (value == null) { return; }

            const displayedValue = this.formatter(value);
            const formattedValue = this.valueFormatterService.formatValue(this.column, null, null, displayedValue);

            if (matchesFilter(displayedValue) || matchesFilter(formattedValue)) {
                this.displayedValues.push(value);
            }
        });
    }

    public getDisplayedValueCount(): number {
        return this.displayedValues.length;
    }

    public getDisplayedValue(index: any): string {
        return this.displayedValues[index];
    }

    public selectAllUsingMiniFilter(): void {
        _.forEach(this.miniFilter ? this.displayedValues : this.allValues, value => this.selectValue(value));
    }

    public isFilterActive(): boolean {
        return this.allValues.length !== this.selectedValues.size;
    }

    public selectNothingUsingMiniFilter(): void {
        if (this.miniFilter) {
            _.forEach(this.displayedValues, it => this.unselectValue(it));
        } else {
            this.selectNothing();
        }
    }

    private selectNothing(): void {
        this.selectedValues.clear();
    }

    public getUniqueValueCount(): number {
        return this.allValues.length;
    }

    public getUniqueValue(index: any): string | null {
        return this.allValues[index];
    }

    public unselectValue(value: string): void {
        this.selectedValues.delete(value);
    }

    public selectAllFromMiniFilter(): void {
        this.selectNothing();
        this.selectAllUsingMiniFilter();
    }

    public selectValue(value: string): void {
        this.selectedValues.add(value);
    }

    public isValueSelected(value: string): boolean {
        return this.selectedValues.has(value);
    }

    public isEverythingSelected(): boolean {
        if (this.miniFilter) {
            return _.filter(this.displayedValues, it => this.isValueSelected(it)).length === this.displayedValues.length;
        } else {
            return this.allValues.length === this.selectedValues.size;
        }
    }

    public isNothingSelected(): boolean {
        if (this.miniFilter) {
            return _.filter(this.displayedValues, it => this.isValueSelected(it)).length === 0;
        } else {
            return this.selectedValues.size === 0;
        }
    }

    public getModel(): string[] | null {
        return this.isFilterActive() ? _.values(this.selectedValues) : null;
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
        if (!isSelectAll && model) {
            this.selectNothingUsingMiniFilter();

            const allValues = _.convertToSet(this.allValues);

            _.forEach(model, value => {
                if (allValues.has(value)) {
                    this.selectValue(value);
                }
            });
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
