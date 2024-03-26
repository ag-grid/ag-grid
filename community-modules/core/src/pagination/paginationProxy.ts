import { IRowModel, RowBounds, RowModelType } from "../interfaces/iRowModel";
import { BeanStub } from "../context/beanStub";
import { Events, ModelUpdatedEvent, PaginationChangedEvent } from "../events";
import { RowNode } from "../entities/rowNode";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { missing, exists } from "../utils/generic";
import { RowPosition } from "../entities/rowPositionUtils";
import { WithoutGridCommon } from "../interfaces/iCommon";

@Bean('paginationProxy')
export class PaginationProxy extends BeanStub {

    @Autowired('rowModel') private rowModel: IRowModel;

    private active: boolean;
    private paginateChildRows: boolean;

    // We should track all the different sources of page size, as we can fall back to the next one if one is missing.
    // or if user preferences change (Example: disabling auto page size option should mean we get page size from
    // page size selector value - if a value was previously selected .. otherwise fall back to initial state value).
    // IMPORTANT: We should always use this.pageSize getter to get the page size instead of accessing
    // directly to these variables, as the getter takes care of returning the correct value based on precedence.
    private pageSizeAutoCalculated?: number; // When paginationAutoPageSize = true or when the pages panel is disabled
    private pageSizeFromPageSizeSelector?: number; // When user selects page size from page size selector.
    private pageSizeFromInitialState?: number; // When the initial grid state is loaded, and a page size rehydrated
    private pageSizeFromGridOptions?: number; // When user sets gridOptions.paginationPageSize.
    private defaultPageSize: 100; // When nothing else set, default page size is 100.

    private totalPages: number;
    private currentPage = 0;

    private topDisplayedRowIndex = 0;
    private bottomDisplayedRowIndex = 0;
    private pixelOffset = 0;
    private topRowBounds: RowBounds;
    private bottomRowBounds: RowBounds;

    private masterRowCount: number = 0;

    @PostConstruct
    private postConstruct() {
        this.active = this.gos.get('pagination');
        this.pageSizeFromGridOptions = this.gos.get('paginationPageSize');
        this.paginateChildRows = this.isPaginateChildRows();

        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedPropertyListener('pagination', this.onPaginationGridOptionChanged.bind(this));
        this.addManagedPropertyListener('paginationPageSize', this.onPageSizeGridOptionChanged.bind(this));

        this.onModelUpdated();
    }

    public ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean {
        const res = this.rowModel.ensureRowHeightsValid(startPixel, endPixel, this.getPageFirstRow(), this.getPageLastRow());
        if (res) {
            this.calculatePages();
        }
        return res;
    }

    private isPaginateChildRows(): boolean {
        const shouldPaginate = this.gos.get('groupRemoveSingleChildren') || this.gos.get('groupRemoveLowestSingleChildren');
        if (shouldPaginate) { return true; }
        return this.gos.get('paginateChildRows');
    }

    private onModelUpdated(modelUpdatedEvent?: WithoutGridCommon<ModelUpdatedEvent>): void {
        this.calculatePages();
        const paginationChangedEvent: WithoutGridCommon<PaginationChangedEvent> = {
            type: Events.EVENT_PAGINATION_CHANGED,
            animate: modelUpdatedEvent ? modelUpdatedEvent.animate : false,
            newData: modelUpdatedEvent ? modelUpdatedEvent.newData : false,
            newPage: modelUpdatedEvent ? modelUpdatedEvent.newPage : false,
            newPageSize: modelUpdatedEvent ? modelUpdatedEvent.newPageSize : false,
            keepRenderedRows: modelUpdatedEvent ? modelUpdatedEvent.keepRenderedRows : false
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    }

    private onPaginationGridOptionChanged(): void {
        this.active = this.gos.get('pagination');
        this.calculatePages();
        const paginationChangedEvent: WithoutGridCommon<PaginationChangedEvent> = {
            type: Events.EVENT_PAGINATION_CHANGED,
            animate: false,
            newData: false,
            newPage: false,
            newPageSize: false,
            // important to keep rendered rows, otherwise every time grid is resized,
            // we would destroy all the rows.
            keepRenderedRows: true
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    }

    private onPageSizeGridOptionChanged(): void {
        this.setPageSize(this.gos.get('paginationPageSize'),'gridOptions');
    }

    public goToPage(page: number): void {
        if (!this.active || this.currentPage === page || typeof this.currentPage !== 'number') { return; }

        this.currentPage = page;
        const event: WithoutGridCommon<ModelUpdatedEvent> = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: true,
            newPageSize: false
        };
        this.onModelUpdated(event);
    }

    public getPixelOffset(): number {
        return this.pixelOffset;
    }

    public getRow(index: number): RowNode | undefined {
        return this.rowModel.getRow(index);
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.rowModel.getRowNode(id);
    }

    public getRowIndexAtPixel(pixel: number): number {
        return this.rowModel.getRowIndexAtPixel(pixel);
    }

    public getCurrentPageHeight(): number {
        if (missing(this.topRowBounds) || missing(this.bottomRowBounds)) {
            return 0;
        }
        return Math.max(this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight - this.topRowBounds.rowTop, 0);
    }

    public getCurrentPagePixelRange(): {pageFirstPixel: number, pageLastPixel: number} {
        const pageFirstPixel = this.topRowBounds ? this.topRowBounds.rowTop : 0;
        const pageLastPixel = this.bottomRowBounds ? this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight : 0;
        return {pageFirstPixel, pageLastPixel};
    }

    public isRowPresent(rowNode: RowNode): boolean {
        if (!this.rowModel.isRowPresent(rowNode)) {
            return false;
        }
        const nodeIsInPage = rowNode.rowIndex! >= this.topDisplayedRowIndex && rowNode.rowIndex! <= this.bottomDisplayedRowIndex;
        return nodeIsInPage;
    }

    public isEmpty(): boolean {
        return this.rowModel.isEmpty();
    }

    public isRowsToRender(): boolean {
        return this.rowModel.isRowsToRender();
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        return this.rowModel.forEachNode(callback);
    }

    public forEachNodeOnPage(callback: (rowNode: RowNode) => void) {
        const firstRow = this.getPageFirstRow();
        const lastRow = this.getPageLastRow();
        for (let i = firstRow; i <= lastRow; i++) {
            const node = this.getRow(i);
            if (node) {
                callback(node);
            }
        }
    }

    public getType(): RowModelType {
        return this.rowModel.getType();
    }

    public getRowBounds(index: number): RowBounds {
        const res = this.rowModel.getRowBounds(index)!;
        res.rowIndex = index;
        return res;
    }

    public getPageFirstRow(): number {
        return this.topRowBounds ? this.topRowBounds.rowIndex! : -1;
    }

    public getPageLastRow(): number {
        return this.bottomRowBounds ? this.bottomRowBounds.rowIndex! : -1;
    }

    public getRowCount(): number {
        return this.rowModel.getRowCount();
    }

    public getPageForIndex(index: number): number {
        return Math.floor(index / this.pageSize);
    }

    public goToPageWithIndex(index: any): void {
        if (!this.active) { return; }

        const pageNumber = this.getPageForIndex(index);
        this.goToPage(pageNumber);
    }

    public isRowInPage(row: RowPosition): boolean {
        if (!this.active) { return true; }
        const rowPage = this.getPageForIndex(row.rowIndex);
        return rowPage === this.currentPage;
    }

    public isLastPageFound(): boolean {
        return this.rowModel.isLastRowIndexKnown();
    }

    public getCurrentPage(): number {
        return this.currentPage;
    }

    public goToNextPage(): void {
        this.goToPage(this.currentPage + 1);
    }

    public goToPreviousPage(): void {
        this.goToPage(this.currentPage - 1);
    }

    public goToFirstPage(): void {
        this.goToPage(0);
    }

    public goToLastPage(): void {
        const rowCount = this.rowModel.getRowCount();
        const lastPage = Math.floor(rowCount / this.pageSize);
        this.goToPage(lastPage);
    }

    public getPageSize(): number {
        return this.pageSize;
    }

    public getTotalPages(): number {
        return this.totalPages;
    }

    /** This is only for state setting before data has been loaded */
    public setPage(page: number): void {
        this.currentPage = page;
    }

    private get pageSize(): number {
        if (exists(this.pageSizeAutoCalculated)) { return this.pageSizeAutoCalculated; }
        if (exists(this.pageSizeFromPageSizeSelector)) { return this.pageSizeFromPageSizeSelector; }
        if (exists(this.pageSizeFromInitialState)) { return this.pageSizeFromInitialState; }
        if (exists(this.pageSizeFromGridOptions)) { return this.pageSizeFromGridOptions; }
        return this.defaultPageSize;
    }

    public unsetAutoCalculatedPageSize(): void {
        if (this.pageSizeAutoCalculated === undefined) { return; }
        const oldPageSize = this.pageSizeAutoCalculated;

        this.pageSizeAutoCalculated = undefined;

        if (this.pageSize === oldPageSize) { return; }
        this.onModelUpdated({
            type: Events.EVENT_MODEL_UPDATED,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: false,
            newPageSize: true,
        });
    }

    public setPageSize(size: number, source: 'autoCalculated' | 'pageSizeSelector' | 'initialState' | 'gridOptions'): void {
        const currentSize = this.pageSize;
        switch (source) {
            case 'autoCalculated':
                this.pageSizeAutoCalculated = size;
                break;
            case 'pageSizeSelector':
                this.pageSizeFromPageSizeSelector = size;
                if (this.currentPage !== 0) { this.goToFirstPage(); }
                break;
            case 'initialState':
                this.pageSizeFromInitialState = size;
                break;
            case 'gridOptions':
                this.pageSizeFromGridOptions = size;
                this.pageSizeFromInitialState = undefined;
                this.pageSizeFromPageSizeSelector = undefined;
                if (this.currentPage !== 0) { this.goToFirstPage(); }
                break;
        }

        if (currentSize !== this.pageSize) {
            const event: WithoutGridCommon<ModelUpdatedEvent> = {
                type: Events.EVENT_MODEL_UPDATED,
                animate: false,
                keepRenderedRows: false,
                newData: false,
                newPage: false,
                newPageSize: true,
            };

            this.onModelUpdated(event);
        }
    }

    private calculatePages(): void {
        if (this.active) {
            if (this.paginateChildRows) {
                this.calculatePagesAllRows();
            } else {
                this.calculatePagesMasterRowsOnly();
            }
        } else {
            this.calculatedPagesNotActive();
        }

        this.topRowBounds = this.rowModel.getRowBounds(this.topDisplayedRowIndex)!;
        if (this.topRowBounds) {
            this.topRowBounds.rowIndex = this.topDisplayedRowIndex;
        }

        this.bottomRowBounds = this.rowModel.getRowBounds(this.bottomDisplayedRowIndex)!;
        if (this.bottomRowBounds) {
            this.bottomRowBounds.rowIndex = this.bottomDisplayedRowIndex;
        }

        this.setPixelOffset(exists(this.topRowBounds) ? this.topRowBounds.rowTop : 0);
    }

    private setPixelOffset(value: number): void {
        if (this.pixelOffset === value) { return; }

        this.pixelOffset = value;
        this.eventService.dispatchEvent({type: Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED});
    }

    private setZeroRows(): void {
        this.masterRowCount = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = -1;
        this.currentPage = 0;
        this.totalPages = 0;
    }

    private adjustCurrentPageIfInvalid() {

        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages - 1;
        }

        if (!isFinite(this.currentPage) || isNaN(this.currentPage) || this.currentPage < 0) {
            this.currentPage = 0;
        }
    }

    private calculatePagesMasterRowsOnly(): void {

        // const csrm = <ClientSideRowModel> this.rowModel;
        // const rootNode = csrm.getRootNode();
        // const masterRows = rootNode.childrenAfterSort;

        this.masterRowCount = this.rowModel.getTopLevelRowCount();

        // we say <=0 (rather than =0) as viewport returns -1 when no rows
        if (this.masterRowCount <= 0) {
            this.setZeroRows();
            return;
        }

        const masterLastRowIndex = this.masterRowCount - 1;
        this.totalPages = Math.floor((masterLastRowIndex) / this.pageSize) + 1;

        this.adjustCurrentPageIfInvalid();

        const masterPageStartIndex = this.pageSize * this.currentPage;
        let masterPageEndIndex = (this.pageSize * (this.currentPage + 1)) - 1;

        if (masterPageEndIndex > masterLastRowIndex) {
            masterPageEndIndex = masterLastRowIndex;
        }

        this.topDisplayedRowIndex = this.rowModel.getTopLevelRowDisplayedIndex(masterPageStartIndex);
        // masterRows[masterPageStartIndex].rowIndex;

        if (masterPageEndIndex === masterLastRowIndex) {
            // if showing the last master row, then we want to show the very last row of the model
            this.bottomDisplayedRowIndex = this.rowModel.getRowCount() - 1;
        } else {
            const firstIndexNotToShow = this.rowModel.getTopLevelRowDisplayedIndex(masterPageEndIndex + 1);
            //masterRows[masterPageEndIndex + 1].rowIndex;
            // this gets the index of the last child - eg current row is open, we want to display all children,
            // the index of the last child is one less than the index of the next parent row.
            this.bottomDisplayedRowIndex = firstIndexNotToShow - 1;
        }
    }

    public getMasterRowCount(): number {
        return this.masterRowCount;
    }

    private calculatePagesAllRows(): void {
        this.masterRowCount = this.rowModel.getRowCount();

        if (this.masterRowCount === 0) {
            this.setZeroRows();
            return;
        }

        const maxRowIndex = this.masterRowCount - 1;
        this.totalPages = Math.floor((maxRowIndex) / this.pageSize) + 1;

        this.adjustCurrentPageIfInvalid();

        this.topDisplayedRowIndex = this.pageSize * this.currentPage;
        this.bottomDisplayedRowIndex = (this.pageSize * (this.currentPage + 1)) - 1;

        if (this.bottomDisplayedRowIndex > maxRowIndex) {
            this.bottomDisplayedRowIndex = maxRowIndex;
        }
    }

    private calculatedPagesNotActive(): void {
        this.setPageSize(this.masterRowCount, 'autoCalculated');
        this.totalPages = 1;
        this.currentPage = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = this.rowModel.getRowCount() - 1;
    }
}
