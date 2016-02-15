// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import FilterManager from "../filter/filterManager";
import { RowNode } from "../entities/rowNode";
import ValueService from "../valueService";
import GroupCreator from "../groupCreator";
import EventService from "../eventService";
export default class InMemoryRowController {
    private gridOptionsWrapper;
    private columnController;
    private angularGrid;
    private filterManager;
    private $scope;
    private allRows;
    private rowsAfterGroup;
    private rowsAfterFilter;
    private rowsAfterSort;
    private rowsToDisplay;
    private model;
    private groupCreator;
    private valueService;
    private eventService;
    constructor();
    init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, angularGrid: any, filterManager: FilterManager, $scope: any, groupCreator: GroupCreator, valueService: ValueService, eventService: EventService): void;
    private createModel();
    getRowAtPixel(pixelToMatch: number): number;
    private isRowInPixel(rowNode, pixelToMatch);
    getVirtualRowCombinedHeight(): number;
    getModel(): any;
    forEachInMemory(callback: Function): void;
    forEachNode(callback: Function): void;
    forEachNodeAfterFilter(callback: Function): void;
    forEachNodeAfterFilterAndSort(callback: Function): void;
    private recursivelyWalkNodesAndCallback(nodes, callback, recursionType, index);
    updateModel(step: any): void;
    private ensureRowHasHeight(rowNode);
    private defaultGroupAggFunctionFactory(valueColumns);
    doAggregate(): void;
    expandOrCollapseAll(expand: boolean, rowNodes: RowNode[]): void;
    private recursivelyClearAggData(nodes);
    private recursivelyCreateAggData(nodes, groupAggFunction, level);
    private doSort();
    private recursivelyResetSort(rowNodes);
    private sortList(nodes, sortOptions);
    private updateChildIndexes(nodes);
    onRowGroupChanged(): void;
    private doRowGrouping();
    private doFilter();
    private filterItems(rowNodes);
    private recursivelyResetFilter(nodes);
    setAllRows(rows: RowNode[], firstId?: number): void;
    private recursivelyAddIdToNodes(nodes, index);
    private recursivelyCheckUserProvidedNodes(nodes, parent, level);
    private getTotalChildCount(rowNodes);
    private nextRowTop;
    private doRowsToDisplay();
    private recursivelyAddToRowsToDisplay(rowNodes);
    private addRowNodeToRowsToDisplay(rowNode);
    private createFooterNode(groupNode);
}
