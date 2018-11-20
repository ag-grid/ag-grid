// ag-grid-enterprise v19.1.3
import { ColDef, Column, IRowModel, ValueFormatterService } from "ag-grid-community";
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CB = 1,
    NOT_PROVIDED = 2
}
export declare class SetFilterModel {
    private colDef;
    private filterParams;
    private clientSideRowModel;
    private valueGetter;
    private allUniqueValues;
    private availableUniqueValues;
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
    constructor(colDef: ColDef, rowModel: IRowModel, valueGetter: any, doesRowPassOtherFilters: any, suppressSorting: boolean, modelUpdatedFunc: (values: string[], selected?: string[]) => void, isLoadingFunc: (loading: boolean) => void, valueFormatterService: ValueFormatterService, column: Column);
    refreshAfterNewRowsLoaded(keepSelection: any, isSelectAll: boolean): void;
    refreshValues(valuesToUse: string[], keepSelection: any, isSelectAll: boolean): void;
    private refreshSelection;
    refreshAfterAnyFilterChanged(): void;
    private createAllUniqueValues;
    private onAsyncValuesLoaded;
    private areValuesSync;
    setValuesType(value: SetFilterModelValuesType): void;
    private setValues;
    private extractSyncValuesToUse;
    private createAvailableUniqueValues;
    private sortValues;
    private getUniqueValues;
    setMiniFilter(newMiniFilter: string): boolean;
    getMiniFilter(): string;
    private processMiniFilter;
    getDisplayedValueCount(): number;
    getDisplayedValue(index: any): any;
    selectEverything(): void;
    private selectOn;
    private valueToKey;
    private keyToValue;
    isFilterActive(): boolean;
    selectNothing(): void;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getModel(): string[] | null;
    setModel(model: string[] | null, isSelectAll?: boolean): void;
    private setSyncModel;
    onFilterValuesReady(callback: () => void): void;
}
//# sourceMappingURL=setFilterModel.d.ts.map