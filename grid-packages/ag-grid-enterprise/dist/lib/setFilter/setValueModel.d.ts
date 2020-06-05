import { ColDef, Column, IRowModel, Promise, ValueFormatterService, IEventEmitter, RowNode } from 'ag-grid-community';
import { ISetFilterLocaleText } from './localeText';
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CALLBACK = 1,
    TAKEN_FROM_GRID_VALUES = 2
}
export declare class SetValueModel implements IEventEmitter {
    private readonly colDef;
    private readonly column;
    private readonly valueGetter;
    private readonly doesRowPassOtherFilters;
    private readonly suppressSorting;
    private readonly setIsLoading;
    private readonly valueFormatterService;
    private readonly translate;
    static EVENT_AVAILABLE_VALUES_CHANGED: string;
    private readonly localEventService;
    private readonly filterParams;
    private readonly clientSideRowModel;
    private readonly formatter;
    private valuesType;
    private miniFilterText;
    /** Values provided to the filter for use. */
    private providedValues;
    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise;
    /** All possible values for the filter, sorted if required. */
    private allValues;
    /** Remaining values when filters from other columns have been applied. */
    private availableValues;
    /** All values that are currently displayed, after the mini-filter has been applied. */
    private displayedValues;
    /** Values that have been selected for this filter. */
    private selectedValues;
    constructor(rowModel: IRowModel, colDef: ColDef, column: Column, valueGetter: (node: RowNode) => any, doesRowPassOtherFilters: (node: RowNode) => boolean, suppressSorting: boolean, setIsLoading: (loading: boolean) => void, valueFormatterService: ValueFormatterService, translate: (key: keyof ISetFilterLocaleText) => string);
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    refreshValues(keepSelection?: boolean): Promise<void>;
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    overrideValues(valuesToUse: string[], keepSelection?: boolean): Promise<void>;
    refreshAfterAnyFilterChanged(): void;
    private updateAllValues;
    setValuesType(value: SetFilterModelValuesType): void;
    getValuesType(): SetFilterModelValuesType;
    isValueAvailable(value: string): boolean;
    private showAvailableOnly;
    private updateAvailableValues;
    private sortValues;
    private getValuesFromRows;
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value?: string): boolean;
    getMiniFilter(): string;
    private updateDisplayedValues;
    getDisplayedValueCount(): number;
    getDisplayedValue(index: any): string;
    isFilterActive(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string | null;
    getValues(): string[];
    selectAllMatchingMiniFilter(clearExistingSelection?: boolean): void;
    deselectAllMatchingMiniFilter(): void;
    selectValue(value: string): void;
    deselectValue(value: string): void;
    isValueSelected(value: string): boolean;
    isEverythingVisibleSelected(): boolean;
    isNothingVisibleSelected(): boolean;
    getModel(): string[] | null;
    setModel(model: string[]): Promise<void>;
    private resetSelectionState;
}
