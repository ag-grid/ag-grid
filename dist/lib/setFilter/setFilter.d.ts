// ag-grid-enterprise v13.2.0
import { BaseFilter, IDoesFilterPassParams, ISetFilterParams } from "ag-grid/main";
export declare class SetFilter extends BaseFilter<string, ISetFilterParams, string[]> {
    private model;
    private suppressSorting;
    private eSelectAll;
    private eSelectAllContainer;
    private eMiniFilter;
    private virtualList;
    private debounceFilterChanged;
    private eCheckedIcon;
    private eUncheckedIcon;
    private eIndeterminateCheckedIcon;
    private selected;
    constructor();
    customInit(): void;
    private updateCheckboxIcon();
    initialiseFilterBodyUi(): void;
    modelFromFloatingFilter(from: string): string[];
    refreshFilterBodyUi(): void;
    private createSetListItem(value);
    afterGuiAttached(params: any): void;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    onNewRowsLoaded(): void;
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    setFilterValues(options: string[]): void;
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    resetFilterValues(): void;
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
