// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import PopupService from "../widgets/agPopupService";
import ValueService from "../valueService";
import { ColumnController } from "../columnController/columnController";
import { Grid } from "../grid";
import Column from "../entities/column";
export default class FilterManager {
    private $compile;
    private $scope;
    private gridOptionsWrapper;
    private grid;
    private allFilters;
    private rowModel;
    private popupService;
    private valueService;
    private columnController;
    private quickFilter;
    private advancedFilterPresent;
    private externalFilterPresent;
    init(grid: Grid, gridOptionsWrapper: GridOptionsWrapper, $compile: any, $scope: any, columnController: ColumnController, popupService: PopupService, valueService: ValueService): void;
    setFilterModel(model: any): void;
    private setModelOnFilterWrapper(filter, newModel);
    getFilterModel(): any;
    setRowModel(rowModel: any): void;
    isAdvancedFilterPresent(): boolean;
    isAnyFilterPresent(): boolean;
    isFilterPresentForCol(colId: any): any;
    private doesFilterPass(node, filterToSkip?);
    setQuickFilter(newFilter: any): boolean;
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private aggregateRowForQuickFilter(node);
    onNewRowsLoaded(): void;
    private createValueGetter(column);
    getFilterApi(column: Column): any;
    private getOrCreateFilterWrapper(column);
    private createFilterWrapper(column);
    destroy(): void;
    private assertMethodHasNoParameters(theMethod);
    showFilter(column: Column, eventSource: any): void;
}
