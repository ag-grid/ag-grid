// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../entities/rowNode";
export interface IRowModel {
    getTopLevelNodes(): RowNode[];
    getRow(index: number): RowNode;
    getRowCount(): number;
    getRowAtPixel(pixel: number): number;
    getRowCombinedHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    refreshModel(step: number, fromIndex?: number): void;
    forEachNode(callback: (rowNode: RowNode) => void): void;
    forEachNodeAfterFilter(callback: (rowNode: RowNode) => void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode) => void): void;
    expandOrCollapseAll(expand: boolean): void;
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;
    setDatasource(datasource: any): void;
}
