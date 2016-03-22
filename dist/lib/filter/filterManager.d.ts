// Type definitions for ag-grid v4.0.5
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
    setQuickFilter(newFilter: any): boolean;
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private aggregateRowForQuickFilter(node);
    private onNewRowsLoaded();
    private createValueGetter(column);
    getFilterApi(column: Column): any;
    getOrCreateFilterWrapper(column: Column): FilterWrapper;
    private createFilterWrapper(column);
    private getFilterFromCache(filterType);
    private onNewColumnsLoaded();
    agDestroy(): void;
    private assertMethodHasNoParameters(theMethod);
}
export interface FilterWrapper {
    column: Column;
    filter: any;
    scope: any;
    gui: HTMLElement;
}
