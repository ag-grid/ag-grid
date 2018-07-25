// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { IRowModel, RowBounds } from "../../interfaces/iRowModel";
import { IDatasource } from "../iDatasource";
import { BeanStub } from "../../context/beanStub";
import { RowDataTransaction } from "../clientSide/clientSideRowModel";
export declare class InfiniteRowModel extends BeanStub implements IRowModel {
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private context;
    private gridApi;
    private columnApi;
    private infiniteCache;
    private rowNodeBlockLoader;
    private datasource;
    private rowHeight;
    getRowBounds(index: number): RowBounds;
    init(): void;
    private destroyDatasource();
    isLastRowFound(): boolean;
    private addEventListeners();
    private onFilterChanged();
    private onSortChanged();
    private onColumnEverything();
    destroy(): void;
    getType(): string;
    setDatasource(datasource: IDatasource): void;
    private checkForDeprecated();
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    private reset();
    private createModelUpdatedEvent();
    private resetCache();
    private destroyCache();
    private onCacheUpdated();
    getRow(rowIndex: number): RowNode;
    getRowNode(id: string): RowNode;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    getCurrentPageHeight(): number;
    getRowIndexAtPixel(pixel: number): number;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    updateRowData(transaction: RowDataTransaction): void;
    isRowPresent(rowNode: RowNode): boolean;
    refreshCache(): void;
    purgeCache(): void;
    getVirtualRowCount(): number;
    isMaxRowFound(): boolean;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    getBlockState(): any;
}
