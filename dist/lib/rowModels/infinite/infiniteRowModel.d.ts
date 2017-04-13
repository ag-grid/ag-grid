// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IRowModel } from "../../interfaces/iRowModel";
import { IDatasource } from "../iDatasource";
import { BeanStub } from "../../context/beanStub";
export declare class InfiniteRowModel extends BeanStub implements IRowModel {
    private gridOptionsWrapper;
    private filterManager;
    private sortController;
    private selectionController;
    private eventService;
    private context;
    private infiniteCache;
    private datasource;
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
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
    private reset();
    private resetCache();
    getRow(rowIndex: number): RowNode;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    getCurrentPageHeight(): number;
    getRowIndexAtPixel(pixel: number): number;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(items: any[], skipRefresh: boolean): void;
    isRowPresent(rowNode: RowNode): boolean;
    refreshCache(): void;
    purgeCache(): void;
    getVirtualRowCount(): number;
    isMaxRowFound(): boolean;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    getPageState(): any;
}
