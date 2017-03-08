// ag-grid-enterprise v8.2.0
import { IFilterParams, IDoesFilterPassParams, ICellRendererComp, ICellRendererFunc, BaseFilter } from "ag-grid/main";
export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries?: boolean;
    values?: any;
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    newRowsAction: string;
    suppressMiniFilter: boolean;
    selectAllOnMiniFilter: boolean;
    comparator?: (a: any, b: any) => number;
}
export declare class SetFilter extends BaseFilter<string, ISetFilterParams, string[]> {
    private model;
    private suppressSorting;
    private eSelectAll;
    private eMiniFilter;
    private virtualList;
    constructor();
    modelFromFloatingFilter(from: string): string[];
    initialiseFilterBodyUi(): void;
    refreshFilterBodyUi(): void;
    private createSetListItem(value);
    afterGuiAttached(params: any): void;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    onNewRowsLoaded(): void;
    onAnyFilterChanged(): void;
    bodyTemplate(): string;
    private updateSelectAll();
    private onMiniFilterChanged();
    private onSelectAll();
    private onItemSelected(value, selected);
    setMiniFilter(newMiniFilter: any): void;
    getMiniFilter(): any;
    selectEverything(): void;
    selectNothing(): void;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): any;
    serialize(): string[];
    parse(dataModel: string[]): void;
    resetState(): void;
}
