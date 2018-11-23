// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ExternalPromise, Promise } from "../utils";
import { Column } from "../entities/column";
import { ColumnEventType } from "../events";
import { IFilterComp } from "../interfaces/iFilter";
export declare type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';
export declare class FilterManager {
    private $compile;
    private $scope;
    private gridOptionsWrapper;
    private gridCore;
    private popupService;
    private valueService;
    private columnController;
    private rowModel;
    private eventService;
    private enterprise;
    private context;
    private columnApi;
    private gridApi;
    private componentResolver;
    static QUICK_FILTER_SEPARATOR: string;
    private allFilters;
    private quickFilter;
    private quickFilterParts;
    private advancedFilterPresent;
    private externalFilterPresent;
    init(): void;
    private setQuickFilterParts;
    setFilterModel(model: any): void;
    private setModelOnFilterWrapper;
    getFilterModel(): any;
    isAdvancedFilterPresent(): boolean;
    private setAdvancedFilterPresent;
    private updateFilterFlagInColumns;
    isAnyFilterPresent(): boolean;
    private doesFilterPass;
    private parseQuickFilter;
    setQuickFilter(newFilter: any): void;
    private checkExternalFilter;
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    private doesRowPassQuickFilterNoCache;
    private doesRowPassQuickFilterCache;
    private doesRowPassQuickFilter;
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private getQuickFilterTextForColumn;
    private aggregateRowForQuickFilter;
    private onNewRowsLoaded;
    private createValueGetter;
    getFilterComponent(column: Column, source: FilterRequestSource): Promise<IFilterComp>;
    isFilterActive(column: Column): boolean;
    getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper;
    cachedFilter(column: Column): FilterWrapper;
    private createFilterInstance;
    private createFilterWrapper;
    private putIntoGui;
    private onNewColumnsLoaded;
    destroyFilter(column: Column, source?: ColumnEventType): void;
    private disposeFilterWrapper;
    destroy(): void;
}
export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: Promise<IFilterComp>;
    scope: any;
    guiPromise: ExternalPromise<HTMLElement>;
}
//# sourceMappingURL=filterManager.d.ts.map