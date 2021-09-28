import { AgPromise, ProvidedFilterModel, IDoesFilterPassParams, IAfterGuiAttachedParams, IFilterComp, IFilterDef, IFilterParams, TabGuardComp } from '@ag-grid-community/core';
export interface IMultiFilterDef extends IFilterDef {
    /**
     * Configures how the filter is shown in the Multi Filter.
     * Default: `inline`
     */
    display?: 'inline' | 'accordion' | 'subMenu';
    /**
     * The title to be used when a filter is displayed inside a sub-menu or accordion.
     */
    title?: string;
}
export interface IMultiFilterParams extends IFilterParams {
    /** An array of filter definition objects. */
    filters?: IMultiFilterDef[];
}
export interface IMultiFilterModel {
    /** Multi filter type.  */
    filterType?: 'multi';
    /**
     * Child filter models in the same order as the filters are specified in `filterParams`.
     */
    filterModels: any[] | null;
}
export declare class MultiFilter extends TabGuardComp implements IFilterComp {
    private readonly filterManager;
    private readonly userComponentFactory;
    private params;
    private filterDefs;
    private filters;
    private guiDestroyFuncs;
    private column;
    private filterChangedCallback;
    private lastOpenedInContainer?;
    private activeFilterIndices;
    private lastActivatedMenuItem;
    private afterFiltersReadyFuncs;
    constructor();
    private postConstruct;
    static getFilterDefs(params: IMultiFilterParams): IMultiFilterDef[];
    init(params: IMultiFilterParams): AgPromise<void>;
    private refreshGui;
    private getFilterTitle;
    private destroyChildren;
    private insertFilterMenu;
    private insertFilterGroup;
    isFilterActive(): boolean;
    getLastActiveFilterIndex(): number | null;
    doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean;
    private getFilterType;
    getModelFromUi(): IMultiFilterModel | null;
    getModel(): ProvidedFilterModel | null;
    setModel(model: IMultiFilterModel | null): AgPromise<void>;
    getChildFilterInstance(index: number): IFilterComp;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    onAnyFilterChanged(): void;
    onNewRowsLoaded(): void;
    destroy(): void;
    private executeFunctionIfExists;
    private createFilter;
    private executeWhenAllFiltersReady;
    private updateActiveList;
    private filterChanged;
    protected onFocusIn(e: FocusEvent): boolean;
}
