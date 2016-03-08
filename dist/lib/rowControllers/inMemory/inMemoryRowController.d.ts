// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowModel } from "./../../interfaces/iRowModel";
export declare class InMemoryRowController implements IRowModel {
    private gridOptionsWrapper;
    private columnController;
    private filterManager;
    private $scope;
    private selectionController;
    private eventService;
    private filterStage;
    private sortStage;
    private flattenStage;
    private groupStage;
    private aggregationStage;
    private allRows;
    private rowsAfterGroup;
    private rowsAfterFilter;
    private rowsAfterSort;
    private rowsToDisplay;
    init(): void;
    refreshModel(step: number, fromIndex?: any, groupState?: any): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    setDatasource(datasource: any): void;
    getTopLevelNodes(): RowNode[];
    getRow(index: number): RowNode;
    getVirtualRowCount(): number;
    getRowCount(): number;
    getRowAtPixel(pixelToMatch: number): number;
    private isRowInPixel(rowNode, pixelToMatch);
    getRowCombinedHeight(): number;
    forEachNode(callback: Function): void;
    forEachNodeAfterFilter(callback: Function): void;
    forEachNodeAfterFilterAndSort(callback: Function): void;
    private recursivelyWalkNodesAndCallback(nodes, callback, recursionType, index);
    doAggregate(): void;
    expandOrCollapseAll(expand: boolean): void;
    private doSort();
    private doRowGrouping(groupState);
    private restoreGroupState(groupState);
    private doFilter();
    setRowData(rowData: any[], refresh: boolean, firstId?: number): void;
    private getGroupState();
    private createRowNodesFromData(rowData, firstId?);
    private doRowsToDisplay();
}
