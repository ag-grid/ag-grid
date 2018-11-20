// ag-grid-enterprise v19.1.3
import { BaseFilter, IDoesFilterPassParams, ISetFilterParams, SerializedSetFilter } from "ag-grid-community";
export declare class SetFilter extends BaseFilter<string, ISetFilterParams, string[] | SerializedSetFilter | null> {
    private model;
    private eSelectAll;
    private eSelectAllContainer;
    private eMiniFilter;
    private eFilterLoading;
    private valueFormatterService;
    private selectAllState;
    private virtualList;
    private debounceFilterChanged;
    private eCheckedIcon;
    private eUncheckedIcon;
    private eIndeterminateCheckedIcon;
    constructor();
    customInit(): void;
    private updateCheckboxIcon;
    setLoading(loading: boolean): void;
    initialiseFilterBodyUi(): void;
    modelFromFloatingFilter(from: string): string[] | SerializedSetFilter;
    refreshFilterBodyUi(): void;
    private createSetListItem;
    afterGuiAttached(params: any): void;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    onNewRowsLoaded(): void;
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     * @param selectAll If by default all the values should be selected.
     * @param notify If we should let know the model that the values of the filter have changed
     * @param toSelect The subset of options to subselect
     */
    setFilterValues(options: string[], selectAll?: boolean, notify?: boolean, toSelect?: string[]): void;
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    resetFilterValues(): void;
    onAnyFilterChanged(): void;
    bodyTemplate(): string;
    private updateSelectAll;
    private onMiniFilterChanged;
    private onSelectAll;
    private doSelectAll;
    private onItemSelected;
    setMiniFilter(newMiniFilter: any): void;
    getMiniFilter(): string;
    selectEverything(): void;
    selectNothing(): void;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string;
    serialize(): string[] | SerializedSetFilter | null;
    parse(dataModel: string[] | SerializedSetFilter): void;
    resetState(): void;
    isFilterConditionActive(): boolean;
}
//# sourceMappingURL=setFilter.d.ts.map