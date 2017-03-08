// Type definitions for ag-grid v8.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IRowModel } from "../../interfaces/iRowModel";
import { RowNode } from "../../entities/rowNode";
export interface IEnterpriseGetRowsParams {
    successCallback(rowsThisPage: any[]): void;
    failCallback(): void;
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    groupKeys: string[];
}
export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
}
export declare class ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
export declare class EnterpriseRowModel implements IRowModel {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private flattenStage;
    private columnController;
    private rootNode;
    private datasource;
    private rowHeight;
    private rowsToDisplay;
    private nextId;
    private instanceVersion;
    private postConstruct();
    private onColumnRowGroupChanged();
    private onRowGroupOpened(event);
    private reset();
    setDatasource(datasource: IEnterpriseDatasource): void;
    private loadNode(rowNode);
    private createGroupKeys(groupNode);
    private createLoadParams(rowNode);
    private toValueObjects(columns);
    private successCallback(instanceVersion, parentNode, dataItems);
    private mapAndFireModelUpdated();
    private failCallback(instanceVersion, rowNode);
    getRow(index: number): RowNode;
    getRowCount(): number;
    getRowIndexAtPixel(pixel: number): number;
    getRowCombinedHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getType(): string;
    private doRowsToDisplay();
    forEachNode(callback: (rowNode: RowNode) => void): void;
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(item: any[], skipRefresh: boolean): void;
    isRowPresent(rowNode: RowNode): boolean;
}
