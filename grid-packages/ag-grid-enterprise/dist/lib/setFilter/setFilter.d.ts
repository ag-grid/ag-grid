import { IDoesFilterPassParams, ISetFilterParams, ProvidedFilter, IAfterGuiAttachedParams, AgPromise } from 'ag-grid-community';
import { SetValueModel } from './setValueModel';
import { SetFilterModel } from './setFilterModel';
export declare class SetFilter extends ProvidedFilter<SetFilterModel> {
    static SELECT_ALL_VALUE: string;
    private readonly eMiniFilter;
    private readonly eFilterLoading;
    private readonly eSetFilterList;
    private readonly eNoMatches;
    private readonly valueFormatterService;
    private valueModel;
    private setFilterParams;
    private virtualList;
    private appliedModelValues;
    constructor();
    protected updateUiVisibility(): void;
    protected createBodyTemplate(): string;
    protected handleKeyDown(e: KeyboardEvent): void;
    private handleKeySpace;
    private handleKeyEnter;
    protected getCssIdentifier(): string;
    private setModelAndRefresh;
    protected resetUiToDefaults(): AgPromise<void>;
    protected setModelIntoUi(model: SetFilterModel): AgPromise<void>;
    getModelFromUi(): SetFilterModel | null;
    getModel(): SetFilterModel;
    getFilterType(): string;
    getValueModel(): SetValueModel | null;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: ISetFilterParams): void;
    private applyExcelModeOptions;
    private checkSetFilterDeprecatedParams;
    private addEventListenersForDataChanges;
    private syncAfterDataChange;
    /** @deprecated since version 23.2. The loading screen is displayed automatically when the set filter is retrieving values. */
    setLoading(loading: boolean): void;
    private showOrHideLoadingScreen;
    private initialiseFilterBodyUi;
    private initVirtualList;
    private getSelectAllLabel;
    private createSetListItem;
    private initMiniFilter;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    applyModel(): boolean;
    protected isModelValid(model: SetFilterModel): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    onNewRowsLoaded(): void;
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    setFilterValues(options: string[]): void;
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    resetFilterValues(): void;
    refreshFilterValues(): void;
    onAnyFilterChanged(): void;
    private onMiniFilterInput;
    private updateUiAfterMiniFilterChange;
    private showOrHideResults;
    private resetUiToActiveModel;
    private onMiniFilterKeyPress;
    private filterOnAllVisibleValues;
    private focusRowIfAlive;
    private onSelectAll;
    private onItemSelected;
    setMiniFilter(newMiniFilter: string | null): void;
    getMiniFilter(): string | null;
    /** @deprecated since version 23.2. Please use setModel instead. */
    selectEverything(): void;
    /** @deprecated since version 23.2. Please use setModel instead. */
    selectNothing(): void;
    /** @deprecated since version 23.2. Please use setModel instead. */
    unselectValue(value: string): void;
    /** @deprecated since version 23.2. Please use setModel instead. */
    selectValue(value: string): void;
    private refresh;
    /** @deprecated since version 23.2. Please use getModel instead. */
    isValueSelected(value: string): boolean;
    /** @deprecated since version 23.2. Please use getModel instead. */
    isEverythingSelected(): boolean;
    /** @deprecated since version 23.2. Please use getModel instead. */
    isNothingSelected(): boolean;
    /** @deprecated since version 23.2. Please use getValues instead. */
    getUniqueValueCount(): number;
    /** @deprecated since version 23.2. Please use getValues instead. */
    getUniqueValue(index: any): string | null;
    getValues(): (string | null)[];
    refreshVirtualList(): void;
    private translateForSetFilter;
    private isSelectAllSelected;
    destroy(): void;
}
