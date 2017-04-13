// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { BeanStub } from "../context/beanStub";
import { IPaginationService } from "./pagination/serverPaginationService";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "../entities/rowNode";
export declare class RowBounds {
    rowTop: number;
    rowHeight: number;
}
export declare class PaginationAutoPageSizeService extends BeanStub {
    private gridPanel;
    private eventService;
    private gridOptionsWrapper;
    private scrollVisibleService;
    private notActive();
    private postConstruct();
    private onScrollVisibilityChanged();
    private onBodyHeightChanged();
    private checkPageSize();
}
export declare class PaginationProxy extends BeanStub implements IPaginationService, IRowModel {
    private rowModel;
    private gridPanel;
    private eventService;
    private gridOptionsWrapper;
    private active;
    private pageSize;
    private totalPages;
    private currentPage;
    private topRowIndex;
    private bottomRowIndex;
    private pixelOffset;
    private topRowBounds;
    private bottomRowBounds;
    private postConstruct();
    isLastRowFound(): boolean;
    private onModelUpdated(refreshEvent?);
    goToPage(page: number): void;
    getPixelOffset(): number;
    getRow(index: number): RowNode;
    getRowIndexAtPixel(pixel: number): number;
    getCurrentPageHeight(): number;
    isRowPresent(rowNode: RowNode): boolean;
    private isRowInPage(rowNode);
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(items: any[], skipRefresh: boolean): void;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    forEachNode(callback: (rowNode: RowNode) => void): void;
    getType(): string;
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    goToPageWithIndex(index: any): void;
    getTotalRowCount(): number;
    isLastPageFound(): boolean;
    getCurrentPage(): number;
    goToNextPage(): void;
    goToPreviousPage(): void;
    goToFirstPage(): void;
    goToLastPage(): void;
    getPageSize(): number;
    getTotalPages(): number;
    private setPageSize();
    private setIndexesAndBounds();
}
