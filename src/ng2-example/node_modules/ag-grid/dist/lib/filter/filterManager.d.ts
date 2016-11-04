// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
import { IFilter } from "../interfaces/iFilter";
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
    private allFilters;
    private quickFilter;
    private advancedFilterPresent;
    private externalFilterPresent;
    private availableFilters;
    init(): void;
    registerFilter(key: string, Filter: any): void;
    setFilterModel(model: any): void;
    private setModelOnFilterWrapper(filter, newModel);
    getFilterModel(): any;
    isAdvancedFilterPresent(): boolean;
    isAnyFilterPresent(): boolean;
    private doesFilterPass(node, filterToSkip?);
    private parseQuickFilter(newFilter);
    setQuickFilter(newFilter: any): void;
    private checkExternalFilter();
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private aggregateRowForQuickFilter(node);
    private onNewRowsLoaded();
    private createValueGetter(column);
    getFilterComponent(column: Column): IFilter;
    getOrCreateFilterWrapper(column: Column): FilterWrapper;
    private createFilterInstance(column);
    private createParams(filterWrapper);
    private createFilterWrapper(column);
    private initialiseFilterAndPutIntoGui(filterWrapper);
    private getFilterFromCache(filterType);
    private onNewColumnsLoaded();
    destroyFilter(column: Column): void;
    private disposeFilterWrapper(filterWrapper);
    destroy(): void;
    private assertMethodHasNoParameters(theMethod);
}
export interface FilterWrapper {
    column: Column;
    filter: IFilter;
    scope: any;
    gui: HTMLElement;
}
