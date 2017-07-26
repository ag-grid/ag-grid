// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IRowModel, RowBounds } from "../../interfaces/iRowModel";
import { IDatasource } from "../iDatasource";
import { BeanStub } from "../../context/beanStub";
import { RowDataTransaction } from "../inMemory/inMemoryRowModel";
export declare class InfiniteRowModel extends BeanStub implements IRowModel {
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private context;
    private infiniteCache;
    private rowNodeBlockLoader;
    private datasource;
    private rowHeight;
    getRowBounds(index: number): RowBounds;
    init(): void;
    isLastRowFound(): boolean;
    private addEventListeners();
    private onFilterChanged();
    private onSortChanged();
    destroy(): void;
    getType(): string;
    setDatasource(datasource: IDatasource): void;
    private checkForDeprecated();
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    private reset();
    private resetCache();
    private destroyCache();
    private onCacheUpdated();
    getRow(rowIndex: number): RowNode;
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
