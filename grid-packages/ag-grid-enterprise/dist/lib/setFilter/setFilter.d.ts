import { IDoesFilterPassParams, ISetFilterParams, ProvidedFilter, IAfterGuiAttachedParams, AgPromise, ISetFilter, SetFilterModel } from 'ag-grid-community';
import { SetValueModel } from './setValueModel';
export declare class SetFilter<V> extends ProvidedFilter<SetFilterModel, V> implements ISetFilter {
    static SELECT_ALL_VALUE: string;
    private readonly eMiniFilter;
    private readonly eFilterLoading;
    private readonly eSetFilterList;
    private readonly eNoMatches;
    private readonly valueFormatterService;
    private valueModel;
    private setFilterParams;
    private virtualList;
    private positionableFeature;
    private caseSensitive;
    private appliedModelValues;
    constructor();
    protected postConstruct(): void;
    protected updateUiVisibility(): void;
    protected createBodyTemplate(): string;
    protected handleKeyDown(e: KeyboardEvent): void;
    private handleKeySpace;
    private handleKeyEnter;
    protected getCssIdentifier(): string;
    private setModelAndRefresh;
    protected resetUiToDefaults(): AgPromise<void>;
    protected setModelIntoUi(model: SetFilterModel | null): AgPromise<void>;
    getModelFromUi(): SetFilterModel | null;
    getFilterType(): 'set';
    getValueModel(): SetValueModel | null;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: ISetFilterParams): void;
    private applyExcelModeOptions;
    private addEventListenersForDataChanges;
    private syncAfterDataChange;
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
    private isValuesTakenFromGrid;
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
    private refresh;
    getValues(): (string | null)[];
    refreshVirtualList(): void;
    private translateForSetFilter;
    private isSelectAllSelected;
    destroy(): void;
    private caseFormat;
}
