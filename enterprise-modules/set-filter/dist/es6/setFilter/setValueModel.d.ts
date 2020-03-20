import { ColDef, Column, IRowModel, ValueFormatterService, IEventEmitter } from "@ag-grid-community/core";
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CB = 1,
    NOT_PROVIDED = 2
}
export declare class SetValueModel implements IEventEmitter {
    static EVENT_AVAILABLE_VALUES_CHANGES: string;
    private colDef;
    private filterParams;
    private clientSideRowModel;
    private valueGetter;
    private allUniqueValues;
    private availableUniqueValues;
    private availableUniqueValuesMap;
    private displayedValues;
    private miniFilter;
    private selectedValuesCount;
    private selectedValuesMap;
    private suppressSorting;
    private formatter;
    private showingAvailableOnly;
    private valuesType;
    private doesRowPassOtherFilters;
    private modelUpdatedFunc;
    private isLoadingFunc;
    private filterValuesExternalPromise;
    private filterValuesPromise;
    private valueFormatterService;
    private column;
    private localEventService;
    constructor(colDef: ColDef, rowModel: IRowModel, valueGetter: any, doesRowPassOtherFilters: any, suppressSorting: boolean, modelUpdatedFunc: (values: string[] | null, selected?: string[] | null) => void, isLoadingFunc: (loading: boolean) => void, valueFormatterService: ValueFormatterService, column: Column);
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    refreshAfterNewRowsLoaded(keepSelection: any, everythingSelected: boolean): void;
    refreshValues(valuesToUse: string[], keepSelection: any, isSelectAll: boolean): void;
    private refreshSelection;
    refreshAfterAnyFilterChanged(): void;
    private createAllUniqueValues;
    private onAsyncValuesLoaded;
    private areValuesSync;
    setValuesType(value: SetFilterModelValuesType): void;
    getValuesType(): SetFilterModelValuesType;
    private setValues;
    private extractSyncValuesToUse;
    isValueAvailable(value: string): boolean;
    private createAvailableUniqueValues;
    private sortValues;
    private getUniqueValues;
    setMiniFilter(newMiniFilter: string | null): boolean;
    getMiniFilter(): string;
    private processMiniFilter;
    getDisplayedValueCount(): number;
    getDisplayedValue(index: any): any;
    selectAllUsingMiniFilter(): void;
    private selectOn;
    private valueToKey;
    private keyToValue;
    isFilterActive(): boolean;
    selectNothingUsingMiniFilter(): void;
    private selectNothing;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string | null;
    unselectValue(value: any): void;
    selectAllFromMiniFilter(): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getModel(): string[] | null;
    setModel(model: string[] | null, isSelectAll?: boolean): void;
    private setSyncModel;
    onFilterValuesReady(callback: () => void): void;
}
