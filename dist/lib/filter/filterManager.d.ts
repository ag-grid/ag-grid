// Type definitions for ag-grid v5.0.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
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
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private aggregateRowForQuickFilter(node);
    private onNewRowsLoaded();
    private createValueGetter(column);
    getFilterApi(column: Column): any;
    getOrCreateFilterWrapper(column: Column): FilterWrapper;
    destroyFilter(column: Column): void;
    private createFilterWrapper(column);
    private getFilterFromCache(filterType);
    private onNewColumnsLoaded();
    destroy(): void;
    private assertMethodHasNoParameters(theMethod);
}
export interface FilterWrapper {
    column: Column;
    filter: any;
    scope: any;
    gui: HTMLElement;
}
