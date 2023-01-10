import { SetFilterParams, AgPromise, ValueFormatterService, IEventEmitter, RowNode, SetFilterModelValue, ValueFormatterParams, GridOptionsService, ColumnModel, ValueService } from 'ag-grid-community';
import { ISetFilterLocaleText } from './localeText';
import { SetFilterModelTreeItem } from './iSetDisplayValueModel';
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CALLBACK = 1,
    TAKEN_FROM_GRID_VALUES = 2
}
export interface SetValueModelParams<V> {
    valueFormatterService: ValueFormatterService;
    gridOptionsService: GridOptionsService;
    columnModel: ColumnModel;
    valueService: ValueService;
    filterParams: SetFilterParams<any, V>;
    setIsLoading: (loading: boolean) => void;
    translate: (key: keyof ISetFilterLocaleText) => string;
    caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat;
    createKey: (value: V | null, node?: RowNode) => string | null;
    valueFormatter: (params: ValueFormatterParams) => string;
    usingComplexObjects?: boolean;
    treeDataTreeList?: boolean;
    groupingTreeList?: boolean;
}
/** @param V type of value in the Set Filter */
export declare class SetValueModel<V> implements IEventEmitter {
    static EVENT_AVAILABLE_VALUES_CHANGED: string;
    private readonly localEventService;
    private readonly formatter;
    private readonly clientSideValuesExtractor;
    private readonly doesRowPassOtherFilters;
    private readonly suppressSorting;
    private readonly keyComparator;
    private readonly entryComparator;
    private readonly compareByValue;
    private readonly convertValuesToStrings;
    private readonly caseSensitive;
    private readonly displayValueModel;
    private readonly filterParams;
    private readonly setIsLoading;
    private readonly translate;
    private readonly caseFormat;
    private readonly createKey;
    private readonly usingComplexObjects;
    private valuesType;
    private miniFilterText;
    /** Values provided to the filter for use. */
    private providedValues;
    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise;
    /** All possible values for the filter, sorted if required. */
    private allValues;
    /** Remaining keys when filters from other columns have been applied. */
    private availableKeys;
    /** Keys that have been selected for this filter. */
    private selectedKeys;
    private initialised;
    constructor(params: SetValueModelParams<V>);
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    refreshValues(): AgPromise<void>;
    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    overrideValues(valuesToUse: (V | null)[]): AgPromise<void>;
    /** @return has anything been updated */
    refreshAfterAnyFilterChanged(): AgPromise<boolean>;
    isInitialised(): boolean;
    private updateAllValues;
    private processAllKeys;
    private validateProvidedValues;
    setValuesType(value: SetFilterModelValuesType): void;
    getValuesType(): SetFilterModelValuesType;
    isKeyAvailable(key: string | null): boolean;
    private showAvailableOnly;
    private updateAvailableKeys;
    sortKeys(nullableValues: Map<string | null, V | null> | null): (string | null)[];
    private getValuesFromRows;
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value?: string | null): boolean;
    getMiniFilter(): string | null;
    updateDisplayedValues(source: 'reload' | 'otherFilter' | 'miniFilter' | 'expansion', allKeys?: (string | null)[]): void;
    getDisplayedValueCount(): number;
    getDisplayedItem(index: number): string | SetFilterModelTreeItem | null;
    getSelectAllItem(): string | SetFilterModelTreeItem;
    hasSelections(): boolean;
    getKeys(): SetFilterModelValue;
    getValues(): (V | null)[];
    getValue(key: string | null): V | null;
    selectAllMatchingMiniFilter(clearExistingSelection?: boolean): void;
    deselectAllMatchingMiniFilter(): void;
    selectKey(key: string | null): void;
    deselectKey(key: string | null): void;
    isKeySelected(key: string | null): boolean;
    isEverythingVisibleSelected(): boolean;
    isNothingVisibleSelected(): boolean;
    getModel(): SetFilterModelValue | null;
    setModel(model: SetFilterModelValue | null): AgPromise<void>;
    private uniqueValues;
    private convertAndGetKey;
    private resetSelectionState;
    hasGroups(): boolean;
    private createTreeDataOrGroupingComparator;
}
