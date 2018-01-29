// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "../entities/rowNode";
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
export declare class PaginationProxy extends BeanStub implements IRowModel {
    private rowModel;
    private gridPanel;
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
    private postConstruct();
    isLastRowFound(): boolean;
    private onModelUpdated(modelUpdatedEvent?);
    goToPage(page: number): void;
    getPixelOffset(): number;
    getRow(index: number): RowNode;
    getRowIndexAtPixel(pixel: number): number;
    getCurrentPageHeight(): number;
    isRowPresent(rowNode: RowNode): boolean;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[];
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
