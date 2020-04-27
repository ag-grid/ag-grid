import { IDoesFilterPassParams, ISetFilterParams, ProvidedFilter, IAfterGuiAttachedParams } from 'ag-grid-community';
import { SetValueModel } from './setValueModel';
import { SetFilterModel } from './setFilterModel';
export declare class SetFilter extends ProvidedFilter {
    private valueModel;
    private eSelectAll;
    private eMiniFilter;
    private eFilterLoading;
    private valueFormatterService;
    private eventService;
    private selectAllState?;
    private setFilterParams;
    private virtualList;
    private appliedModelValues;
    protected updateUiVisibility(): void;
    protected createBodyTemplate(): string;
    protected getCssIdentifier(): string;
    protected resetUiToDefaults(): void;
    protected setModelIntoUi(model: SetFilterModel): void;
    getModelFromUi(): SetFilterModel | null;
    getValueModel(): SetValueModel;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: ISetFilterParams): void;
    private checkSetFilterDeprecatedParams;
    private addEventListenersForDataChanges;
    /** Called when the data in the grid changes, to prompt the set filter values to be updated. */
    private syncValuesAfterDataChange;
    private updateCheckboxIcon;
    setLoading(loading: boolean): void;
    private initialiseFilterBodyUi;
    private initVirtualList;
    private createSetListItem;
    private initMiniFilter;
    private initSelectAll;
    afterGuiAttached(params: IAfterGuiAttachedParams): void;
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
    setFilterValues(options: string[]): void;
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    resetFilterValues(): void;
    onAnyFilterChanged(): void;
    private updateSelectAll;
    private onMiniFilterKeyPress;
    private onMiniFilterInput;
    private onSelectAll;
    private onItemSelected;
    setMiniFilter(newMiniFilter: string): void;
    getMiniFilter(): string;
    selectEverything(): void;
    selectNothing(): void;
    unselectValue(value: string): void;
    selectValue(value: string): void;
    private refresh;
    isValueSelected(value: string): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): string;
    refreshVirtualList(): void;
}
