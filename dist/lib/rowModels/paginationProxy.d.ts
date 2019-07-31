// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "../entities/rowNode";
import { GridPanel } from "../gridPanel/gridPanel";
export declare class PaginationAutoPageSizeService extends BeanStub {
    private eventService;
    private gridOptionsWrapper;
    private scrollVisibleService;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    private notActive;
    private onScrollVisibilityChanged;
    private onBodyHeightChanged;
    private checkPageSize;
}
export declare class PaginationProxy extends BeanStub implements IRowModel {
    private rowModel;
    private eventService;
    private gridOptionsWrapper;
    private selectionController;
    private columnApi;
    private gridApi;
    private active;
    private pageSize;
    private totalPages;
    private currentPage;
    private topRowIndex;
    private bottomRowIndex;
    private pixelOffset;
    private topRowBounds;
    private bottomRowBounds;
    private postConstruct;
    ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean;
    isLastRowFound(): boolean;
    private onModelUpdated;
    goToPage(page: number): void;
    getPixelOffset(): number;
    getRow(index: number): RowNode | null;
    getRowNode(id: string): RowNode | null;
    getRowIndexAtPixel(pixel: number): number;
    getCurrentPageHeight(): number;
    isRowPresent(rowNode: RowNode): boolean;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
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
    private setPageSize;
    private setIndexesAndBounds;
}
