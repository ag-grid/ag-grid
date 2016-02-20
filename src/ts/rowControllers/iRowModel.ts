import {RowNode} from "../entities/rowNode";

export interface IRowModel {

    getTopLevelNodes(): RowNode[];
    getRow(index: number): RowNode;
    getRowCount(): number;
    getRowAtPixel(pixel: number): number;
    getRowCombinedHeight(): number;
    isEmpty(): boolean;
    refreshModel(step: number): void;

    forEachNode(callback: (rowNode: RowNode)=>void): void;
    forEachNodeAfterFilter(callback: (rowNode: RowNode)=>void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=>void): void;

    // in memory model only
    expandOrCollapseAll(expand: boolean): void;
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;

    // virtual row model only
    setDatasource(datasource:any): void;
}