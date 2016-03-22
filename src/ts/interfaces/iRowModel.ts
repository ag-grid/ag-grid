import {RowNode} from "../entities/rowNode";

export interface IRowModel {

    getRow(index: number): RowNode;
    getRowCount(): number;
    getRowAtPixel(pixel: number): number;
    getRowCombinedHeight(): number;
    // does this model have any rows, will be true if rows present, but rows removed by filter
    isEmpty(): boolean;
    // does this model have rows to render, so if filtering removed all rows, returns false
    isRowsToRender(): boolean;

    forEachNode(callback: (rowNode: RowNode)=>void): void;

    // in memory model only
    refreshModel(step: number, fromIndex?: number): void;
    getTopLevelNodes(): RowNode[];
    forEachNodeAfterFilter(callback: (rowNode: RowNode)=>void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=>void): void;
    expandOrCollapseAll(expand: boolean): void;
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;

    // virtual row model only
    setDatasource(datasource:any): void;
}