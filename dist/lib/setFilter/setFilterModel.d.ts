// ag-grid-enterprise v14.1.1
import { ColDef } from "ag-grid/main";
import { IRowModel } from 'ag-grid';
export declare enum SetFilterModelValuesType {
    PROVIDED_LIST = 0,
    PROVIDED_CB = 1,
    NOT_PROVIDED = 2,
}
export declare class SetFilterModel {
    private colDef;
    private filterParams;
    private inMemoryRowModel;
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
    constructor(colDef: ColDef, rowModel: IRowModel, valueGetter: any, doesRowPassOtherFilters: any, suppressSorting: boolean, modelUpdatedFunc: (values: string[]) => void, isLoadingFunc: (loading: boolean) => void);
    refreshAfterNewRowsLoaded(keepSelection: any, isSelectAll: boolean): void;
    refreshValues(valuesToUse: string[], keepSelection: any, isSelectAll: boolean): void;
    private refreshSelection(keepSelection, isSelectAll);
    refreshAfterAnyFilterChanged(): void;
    private createAllUniqueValues();
    private onAsyncValuesLoaded(values);
    private areValuesSync();
    setValuesType(value: SetFilterModelValuesType): void;
    private setValues(valuesToUse);
    private extractSyncValuesToUse();
    private createAvailableUniqueValues();
    private sortValues(values);
    private getUniqueValues(filterOutNotAvailable);
    setMiniFilter(newMiniFilter: any): boolean;
    getMiniFilter(): any;
    private processMiniFilter();
    getDisplayedValueCount(): number;
    getDisplayedValue(index: any): any;
    selectEverything(): void;
    private selectOn(toSelectOn);
    private valueToKey(key);
    private keyToValue(value);
    isFilterActive(): boolean;
    selectNothing(): void;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): any;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getModel(): string[];
    setModel(model: string[], isSelectAll?: boolean): void;
}
