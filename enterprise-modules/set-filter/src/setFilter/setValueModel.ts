import {
    IClientSideRowModel,
    Column,
    Constants,
    ISetFilterParams,
    AgPromise,
    SetFilterValues,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
    TextFilter,
    TextFormatter,
    ValueFormatterService,
    IEventEmitter,
    EventService,
    RowNode,
    _
} from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CALLBACK, TAKEN_FROM_GRID_VALUES
}

const NULL_SUBSTITUTE = '__<ag-grid-pseudo-null>__';

export class SetValueModel implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private readonly localEventService = new EventService();
    private readonly formatter: TextFormatter;
    private readonly clientSideValuesExtractor: ClientSideValuesExtractor;
    private readonly column: Column;
    private readonly doesRowPassOtherFilters: (node: RowNode) => boolean;
    private readonly suppressSorting: boolean;
    private readonly comparator: (a: any, b: any) => number;

    private valuesType: SetFilterModelValuesType;
    private miniFilterText: string | null = null;

    // The lookup for a set is much faster than the lookup for an array, especially when the length of the array is
    // thousands of records long, so where lookups are important we use a set.

    /** Values provided to the filter for use. */
    private providedValues: SetFilterValues | null = null;

    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise: AgPromise<(string | null)[]>;

    /** All possible values for the filter, sorted if required. */
    private allValues: (string | null)[] = [];

    /** Remaining values when filters from other columns have been applied. */
    private availableValues = new Set<string | null>();

    /** All values that are currently displayed, after the mini-filter has been applied. */
    private displayedValues: (string | null)[] = [];

    /** Values that have been selected for this filter. */
    private selectedValues = new Set<string | null>();

    private initialised: boolean = false;

    private caseSensitive?: boolean;

    constructor(
        private readonly filterParams: ISetFilterParams,
        private readonly setIsLoading: (loading: boolean) => void,
        private readonly valueFormatterService: ValueFormatterService,
        private readonly translate: (key: keyof ISetFilterLocaleText) => string,
        private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
    ) {
        const {
            column,
            colDef,
            textFormatter,
            doesRowPassOtherFilter,
            suppressSorting,
            comparator,
            rowModel,
            values,
            caseSensitive
        } = filterParams;

        this.column = column;
        this.formatter = textFormatter || TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.comparator = comparator || colDef.comparator as (a: any, b: any) => number || _.defaultComparator;
        this.caseSensitive = caseSensitive;

        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(
                rowModel as IClientSideRowModel,
                this.filterParams,
                value => this.uniqueKey(value)
            );
        }

        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;

            this.providedValues = values;
        }

        this.updateAllValues().then(updatedValues => this.resetSelectionState(updatedValues || []));
    }

    public addEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.removeEventListener(eventType, listener, async);
    }

    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public refreshValues(): AgPromise<void> {
        const currentModel = this.getModel();

        this.updateAllValues();

        // ensure model is updated for new values
        return this.setModel(currentModel);
    }

    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public overrideValues(valuesToUse: (string | null)[]): AgPromise<void> {
        return new AgPromise<void>(resolve => {
            // wait for any existing values to be populated before overriding
            this.allValuesPromise.then(() => {
                this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                this.providedValues = valuesToUse;
                this.refreshValues().then(() => resolve());
            });
        });
    }

    public refreshAfterAnyFilterChanged(): AgPromise<void> {
        return this.showAvailableOnly() ?
            this.allValuesPromise.then(values => this.updateAvailableValues(values || [])) :
            AgPromise.resolve();
    }

    public isInitialised(): boolean {
        return this.initialised;
    }

    private updateAllValues(): AgPromise<(string | null)[]> {
        this.allValuesPromise = new AgPromise<(string | null)[]>(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    const values = this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES ?
                        this.getValuesFromRows(false) : this.uniqueUnsortedStringArray(this.providedValues as any[]);
                    const sortedValues = this.sortValues(values || []);

                    this.allValues = sortedValues;

                    resolve(sortedValues);

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);

                    const callback = this.providedValues as SetFilterValuesFunc;
                    const { columnApi, api, context, column, colDef } = this.filterParams;
                    const params: SetFilterValuesFuncParams = {
                        success: values => {
                            const processedValues = this.uniqueUnsortedStringArray(values || []);

                            this.setIsLoading(false);

                            const sortedValues = this.sortValues(processedValues || []);

                            this.allValues = sortedValues;

                            resolve(sortedValues);
                        },
                        colDef,
                        column,
                        columnApi,
                        api,
                        context,

                    };

                    window.setTimeout(() => callback(params), 0);

                    break;
                }

                default:
                    throw new Error('Unrecognised valuesType');
            }
        });

        this.allValuesPromise.then(values => this.updateAvailableValues(values || [])).then(() => this.initialised = true);

        return this.allValuesPromise;
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    public isValueAvailable(value: string | null): boolean {
        return this.availableValues.has(value);
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableValues(allValues: (string | null)[]): void {
        // if case insensitive, we need to know the case from the original values
        const uniqueValues = this.caseSensitive ? undefined : this.uniqueValues(allValues);
        const availableValues = this.showAvailableOnly() ? this.sortValues(this.getValuesFromRows(true, uniqueValues)) : allValues;

        this.availableValues = _.convertToSet(availableValues);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });

        this.updateDisplayedValues();
    }

    private sortValues(values: (string | null)[]): (string | null)[] {
        if (this.suppressSorting) { return values; }

        if (!this.filterParams.excelMode || values.indexOf(null) < 0) {
            return values.sort(this.comparator);
        }

        // ensure the blank value always appears last
        return values.filter(v => v != null)!.sort(this.comparator).concat(null);
    }

    private getValuesFromRows(removeUnavailableValues = false, uniqueValues?: { [key: string]: string | null }): (string | null)[] {
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        const predicate = (node: RowNode) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));

        return this.clientSideValuesExtractor.extractUniqueValues(predicate, uniqueValues);
    }

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    public setMiniFilter(value?: string | null): boolean {
        value = _.makeNull(value);

        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }

        this.miniFilterText = value;
        this.updateDisplayedValues();

        return true;
    }

    public getMiniFilter(): string | null {
        return this.miniFilterText;
    }

    private updateDisplayedValues(): void {
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayedValues = _.values(this.availableValues);
            return;
        }

        // if filter present, we filter down the list
        this.displayedValues = [];

        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');

        const matchesFilter = (valueToCheck: string | null): boolean =>
            valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;

        this.availableValues.forEach(value => {
            if (value == null) {
                if (this.filterParams.excelMode && matchesFilter(this.translate('blanks'))) {
                    this.displayedValues.push(value);
                }
            } else {
                const textFormatterValue = this.formatter(value);

                // TODO: should this be applying the text formatter *after* the value formatter?
                const valueFormatterValue = this.valueFormatterService.formatValue(
                    this.column, null, textFormatterValue, this.filterParams.valueFormatter, false);

                if (matchesFilter(textFormatterValue) || matchesFilter(valueFormatterValue)) {
                    this.displayedValues.push(value);
                }
            }
        });
    }

    public getDisplayedValueCount(): number {
        return this.displayedValues.length;
    }

    public getDisplayedValue(index: number): string | null {
        return this.displayedValues[index];
    }

    public hasSelections(): boolean {
        return this.filterParams.defaultToNothingSelected ?
            this.selectedValues.size > 0 :
            this.allValues.length !== this.selectedValues.size;
    }

    public getValues(): (string | null)[] {
        return this.allValues.slice();
    }

    public selectAllMatchingMiniFilter(clearExistingSelection = false): void {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedValues = _.convertToSet(this.allValues);
        } else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) { this.selectedValues.clear(); }

            this.displayedValues.forEach(value => this.selectedValues.add(value));
        }
    }

    public deselectAllMatchingMiniFilter(): void {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedValues.clear();
        } else {
            // ensure everything that matches the mini filter is deselected
            this.displayedValues.forEach(value => this.selectedValues.delete(value));
        }
    }

    public selectValue(value: string | null): void {
        this.selectedValues.add(value);
    }

    public deselectValue(value: string | null): void {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayedValues);
        }

        this.selectedValues.delete(value);
    }

    public isValueSelected(value: string | null): boolean {
        return this.selectedValues.has(value);
    }

    public isEverythingVisibleSelected(): boolean {
        return this.displayedValues.filter(it => this.isValueSelected(it))!.length === this.displayedValues.length;
    }

    public isNothingVisibleSelected(): boolean {
        return this.displayedValues.filter(it => this.isValueSelected(it))!.length === 0;
    }

    public getModel(): (string | null)[] | null {
        return this.hasSelections() ? _.values(this.selectedValues) : null;
    }

    public setModel(model: (string | null)[] | null): AgPromise<void> {
        return this.allValuesPromise.then(values => {
            if (model == null) {
                this.resetSelectionState(values || []);
            } else {
                // select all values from the model that exist in the filter
                this.selectedValues.clear();

                const allValues = this.uniqueValues(values || []);

                model.forEach(value => {
                    const allValue = allValues[this.uniqueKey(value)];
                    if (allValue !== undefined) {
                        this.selectedValues.add(allValue);
                    }
                });
            }
        });
    }

    private uniqueUnsortedStringArray(values: any[]): (string | null)[] {
        const stringifiedResults = _.toStrings(values);
        if (!stringifiedResults) {
            return [];
        }

        const uniqueValues = this.uniqueValues(stringifiedResults);
        /*
        * It is not possible to simply use Object.values(uniqueValues) here as the keys inside uniqueValues could be numeric.
        * Javascript objects sort numeric keys and do not fully respect the insert order, as such to trust the results are unsorted
        * we need to reference the order of the original array as done here.
        */
        return stringifiedResults.map(_.makeNull).filter(value => {
            const key = this.uniqueKey(value);
            if (key in uniqueValues) {
                delete uniqueValues[key];
                return true;
            }
            return false;
        });
    }

    private uniqueValues(values: (string | null)[]): { [key: string]: string | null } {
        // Honour case-sensitivity setting for matching purposes here, preserving original casing
        // in the selectedValues output.
        const uniqueValues: {[key: string]: string | null} = {};
        (values || []).forEach(rawValue => {
            const value = _.makeNull(rawValue);
            const key = this.uniqueKey(value);
            if (uniqueValues[key] === undefined) {
                uniqueValues[key] = value;
            }
        });

        return  uniqueValues;
    }

    private uniqueKey(v: string | null): string {
        return v == null ? NULL_SUBSTITUTE : this.caseFormat(v);
    }

    private resetSelectionState(values: (string | null)[]): void {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedValues.clear();
        } else {
            this.selectedValues = _.convertToSet(values || []);
        }
    }
}
