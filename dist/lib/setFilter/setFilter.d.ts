// ag-grid-enterprise v18.0.1
import { BaseFilter, IDoesFilterPassParams, ISetFilterParams, SerializedSetFilter } from "ag-grid/main";
export declare class SetFilter extends BaseFilter<string, ISetFilterParams, string[] | SerializedSetFilter> {
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
    private updateCheckboxIcon();
    setLoading(loading: boolean): void;
    initialiseFilterBodyUi(): void;
    modelFromFloatingFilter(from: string): string[] | SerializedSetFilter;
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
    private updateSelectAll();
    private onMiniFilterChanged();
    private onSelectAll(event);
    private doSelectAll();
    private onItemSelected(value, selected);
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
    serialize(): string[] | SerializedSetFilter;
    parse(dataModel: string[] | SerializedSetFilter): void;
    resetState(): void;
    isFilterConditionActive(): boolean;
}
