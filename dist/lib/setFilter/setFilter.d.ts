// ag-grid-enterprise v10.0.0
import { IDoesFilterPassParams, BaseFilter, ISetFilterParams } from "ag-grid/main";
export declare class SetFilter extends BaseFilter<string, ISetFilterParams, string[]> {
    private model;
    private suppressSorting;
    private eSelectAll;
    private eMiniFilter;
    private virtualList;
    constructor();
    customInit(): void;
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
