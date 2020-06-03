import { IDoesFilterPassParams, ISetFilterParams, ProvidedFilter, IAfterGuiAttachedParams, Promise } from '@ag-grid-community/core';
import { SetValueModel } from './setValueModel';
import { SetFilterModel } from './setFilterModel';
export declare class SetFilter extends ProvidedFilter {
    private valueModel;
    private eSelectAll;
    private eSelectAllLabel;
    private eMiniFilter;
    private eFilterLoading;
    private eSetFilterList;
    private eNoMatches;
    private eSelectAllContainer;
    private valueFormatterService;
    private focusController;
    private selectAllState?;
    private setFilterParams;
    private virtualList;
    private appliedModelValues;
    protected updateUiVisibility(): void;
    protected postConstruct(): void;
    protected createBodyTemplate(): string;
    private handleKeyDown;
    private handleKeyTab;
    private handleKeySpace;
    private handleKeyEnter;
    protected getCssIdentifier(): string;
    protected resetUiToDefaults(): Promise<void>;
    protected setModelIntoUi(model: SetFilterModel): Promise<void>;
    getModelFromUi(): SetFilterModel | null;
    getValueModel(): SetValueModel;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: ISetFilterParams): void;
    private applyExcelModeOptions;
    private checkSetFilterDeprecatedParams;
    private addEventListenersForDataChanges;
    private syncAfterDataChange;
    /** @deprecated since version 23.2. The loading screen is displayed automatically when the set filter is retrieving values. */
    setLoading(loading: boolean): void;
    private initialiseFilterBodyUi;
    private initVirtualList;
    private createSetListItem;
    private initMiniFilter;
    private initSelectAll;
    afterGuiAttached(params: IAfterGuiAttachedParams): void;
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
    private updateSelectAllCheckbox;
    private onMiniFilterInput;
    private updateUiAfterMiniFilterChange;
    private resetUiToActiveModel;
    private updateSelectAllLabel;
    private onMiniFilterKeyPress;
    private filterOnAllVisibleValues;
    private onSelectAll;
    private onItemSelected;
    setMiniFilter(newMiniFilter: string): void;
    getMiniFilter(): string;
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
    getUniqueValue(index: any): string;
    getValues(): string[];
    refreshVirtualList(): void;
    private translate;
}
