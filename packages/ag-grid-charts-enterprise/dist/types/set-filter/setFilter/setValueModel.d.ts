import { SetFilterParams, AgPromise, IEventEmitter, RowNode, SetFilterModelValue, ValueFormatterParams, GridOptionsService, ColumnModel, ValueService, AgEventListener } from 'ag-grid-community';
import { ISetFilterLocaleText } from './localeText';
import { SetFilterModelTreeItem } from './iSetDisplayValueModel';
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CALLBACK = 1,
    TAKEN_FROM_GRID_VALUES = 2
}
export interface SetValueModelParams<V> {
    gos: GridOptionsService;
    columnModel: ColumnModel;
    valueService: ValueService;
    filterParams: SetFilterParams<any, V>;
    setIsLoading: (loading: boolean) => void;
    translate: (key: keyof ISetFilterLocaleText) => string;
    caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat;
    createKey: (value: V | null | undefined, node?: RowNode) => string | null;
    valueFormatter?: (params: ValueFormatterParams) => string;
    usingComplexObjects?: boolean;
    treeDataTreeList?: boolean;
    groupingTreeList?: boolean;
    addManagedListener: (event: string, listener: (event?: any) => void) => (() => null) | undefined;
}
/** @param V type of value in the Set Filter */
export declare class SetValueModel<V> implements IEventEmitter {
    static EVENT_AVAILABLE_VALUES_CHANGED: string;
    private readonly gos;
    private readonly localEventService;
    private formatter;
    private suppressSorting;
    private readonly clientSideValuesExtractor;
    private readonly doesRowPassOtherFilters;
    private readonly keyComparator;
    private readonly entryComparator;
    private readonly compareByValue;
    private readonly convertValuesToStrings;
    private readonly caseSensitive;
    private displayValueModel;
    private filterParams;
    private readonly setIsLoading;
    private readonly translate;
    private readonly caseFormat;
    private readonly createKey;
    private readonly usingComplexObjects;
    private valuesType;
    private miniFilterText;
    /** When true, in excelMode = 'windows', it adds previously selected filter items to newly checked filter selection */
    private addCurrentSelectionToFilter;
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
    /**
     * Here we keep track of the keys that are currently being used for filtering.
     * In most cases, the filtering keys are the same as the selected keys,
     * but for the specific case when excelMode = 'windows' and the user has ticked 'Add current selection to filter',
     * the filtering keys can be different from the selected keys.
     */
    private filteringKeys;
    private initialised;
    constructor(params: SetValueModelParams<V>);
    addEventListener(eventType: string, listener: AgEventListener, async?: boolean): void;
    removeEventListener(eventType: string, listener: AgEventListener, async?: boolean): void;
    updateOnParamsChange(filterParams: SetFilterParams<any, V>): AgPromise<void>;
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
    private processAllValues;
    private validateProvidedValues;
    setValuesType(value: SetFilterModelValuesType): void;
    getValuesType(): SetFilterModelValuesType;
    isKeyAvailable(key: string | null): boolean;
    private showAvailableOnly;
    private updateAvailableKeys;
    sortKeys(nullableValues: Map<string | null, V | null> | null): (string | null)[];
    private getParamsForValuesFromRows;
    private getValuesFromRows;
    private getValuesFromRowsAsync;
    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    setMiniFilter(value?: string | null): boolean;
    getMiniFilter(): string | null;
    updateDisplayedValues(source: 'reload' | 'otherFilter' | 'miniFilter' | 'expansion', allKeys?: (string | null)[]): void;
    getDisplayedValueCount(): number;
    getDisplayedItem(index: number): string | SetFilterModelTreeItem | null;
    getSelectAllItem(): string | SetFilterModelTreeItem;
    getAddSelectionToFilterItem(): string | SetFilterModelTreeItem;
    hasSelections(): boolean;
    getKeys(): SetFilterModelValue;
    getValues(): (V | null)[];
    getValue(key: string | null): V | null;
    setAddCurrentSelectionToFilter(value: boolean): void;
    private isInWindowsExcelMode;
    isAddCurrentSelectionToFilterChecked(): boolean;
    showAddCurrentSelectionToFilter(): boolean;
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
    setAppliedModelKeys(appliedModelKeys: Set<string | null> | null): void;
    addToAppliedModelKeys(appliedModelKey: string | null): void;
    getAppliedModelKeys(): Set<string | null> | null;
    getCaseFormattedAppliedModelKeys(): Set<string | null> | null;
    hasAppliedModelKey(appliedModelKey: string | null): boolean;
    hasAnyAppliedModelKey(): boolean;
}
