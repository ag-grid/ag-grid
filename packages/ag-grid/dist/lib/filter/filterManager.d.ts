// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ExternalPromise, Promise } from "../utils";
import { Column } from "../entities/column";
import { ColumnEventType } from "../events";
import { IFilterComp } from "../interfaces/iFilter";
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
    private setQuickFilterParts();
    setFilterModel(model: any): void;
    private setModelOnFilterWrapper(filterPromise, newModel);
    getFilterModel(): any;
    isAdvancedFilterPresent(): boolean;
    private setAdvancedFilterPresent();
    private updateFilterFlagInColumns(source);
    isAnyFilterPresent(): boolean;
    private doesFilterPass(node, filterToSkip?);
    private parseQuickFilter(newFilter);
    setQuickFilter(newFilter: any): void;
    private checkExternalFilter();
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    private doesRowPassQuickFilterNoCache(node, filterPart);
    private doesRowPassQuickFilterCache(node, filterPart);
    private doesRowPassQuickFilter(node);
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private getQuickFilterTextForColumn(column, rowNode);
    private aggregateRowForQuickFilter(node);
    private onNewRowsLoaded(source);
    private createValueGetter(column);
    getFilterComponent(column: Column): Promise<IFilterComp>;
    getOrCreateFilterWrapper(column: Column): FilterWrapper;
    cachedFilter(column: Column): FilterWrapper;
    private createFilterInstance(column, $scope);
    private createFilterWrapper(column);
    private putIntoGui(filterWrapper);
    private onNewColumnsLoaded();
    destroyFilter(column: Column, source?: ColumnEventType): void;
    private disposeFilterWrapper(filterWrapper, source);
    destroy(): void;
}
export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: Promise<IFilterComp>;
    scope: any;
    guiPromise: ExternalPromise<HTMLElement>;
}
