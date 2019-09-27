// ag-grid-enterprise v21.2.2
import { IDoesFilterPassParams, ISetFilterParams, ProvidedFilter } from "ag-grid-community";
import { SetFilterModel } from "./setFilterModel";
export declare class SetFilter extends ProvidedFilter {
    private valueModel;
    private eSelectAll;
    private eSelectAllContainer;
    private eMiniFilter;
    private eFilterLoading;
    private valueFormatterService;
    private eventService;
    private selectAllState;
    private setFilterParams;
    private virtualList;
    private eCheckedIcon;
    private eUncheckedIcon;
    private eIndeterminateCheckedIcon;
    private appliedModelValuesMapped;
    protected updateUiVisibility(): void;
    protected createBodyTemplate(): string;
    protected resetUiToDefaults(): void;
    protected setModelIntoUi(model: SetFilterModel): void;
    getModelFromUi(): SetFilterModel | null;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: ISetFilterParams): void;
    private resetFilterValuesAndReapplyModel;
    private setupSyncValuesLikeExcel;
    private updateCheckboxIcon;
    setLoading(loading: boolean): void;
    private initialiseFilterBodyUi;
    private createSetListItem;
    afterGuiAttached(params: any): void;
    applyModel(): boolean;
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
    private updateSelectAll;
    private onMiniFilterKeyPress;
    private onEnterKeyOnMiniFilter;
    private onMiniFilterInput;
    private onSelectAll;
    private doSelectAll;
    private onItemSelected;
    setMiniFilter(newMiniFilter: any): void;
    getMiniFilter(): string | null;
    selectEverything(): void;
    selectNothing(): void;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string | null;
}
