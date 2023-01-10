/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationProxy = void 0;
const beanStub_1 = require("../context/beanStub");
const events_1 = require("../events");
const context_1 = require("../context/context");
const generic_1 = require("../utils/generic");
let PaginationProxy = class PaginationProxy extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.currentPage = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = 0;
        this.pixelOffset = 0;
        this.masterRowCount = 0;
    }
    postConstruct() {
        this.active = this.gridOptionsService.is('pagination');
        this.paginateChildRows = this.isPaginateChildRows();
        this.addManagedListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedPropertyListener('pagination', this.onPaginationPageSizeChanged.bind(this));
        this.addManagedPropertyListener('paginationPageSize', this.onPaginationPageSizeChanged.bind(this));
        this.onModelUpdated();
    }
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
        const res = this.rowModel.ensureRowHeightsValid(startPixel, endPixel, this.getPageFirstRow(), this.getPageLastRow());
        if (res) {
            this.calculatePages();
        }
        return res;
    }
    isPaginateChildRows() {
        const shouldPaginate = this.gridOptionsService.is('groupRemoveSingleChildren') || this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        if (shouldPaginate) {
            return true;
        }
        return this.gridOptionsService.is('paginateChildRows');
    }
    onModelUpdated(modelUpdatedEvent) {
        this.calculatePages();
        const paginationChangedEvent = {
            type: events_1.Events.EVENT_PAGINATION_CHANGED,
            animate: modelUpdatedEvent ? modelUpdatedEvent.animate : false,
            newData: modelUpdatedEvent ? modelUpdatedEvent.newData : false,
            newPage: modelUpdatedEvent ? modelUpdatedEvent.newPage : false,
            keepRenderedRows: modelUpdatedEvent ? modelUpdatedEvent.keepRenderedRows : false
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    }
    onPaginationPageSizeChanged() {
        this.active = this.gridOptionsService.is('pagination');
        this.calculatePages();
        const paginationChangedEvent = {
            type: events_1.Events.EVENT_PAGINATION_CHANGED,
            animate: false,
            newData: false,
            newPage: false,
            // important to keep rendered rows, otherwise every time grid is resized,
            // we would destroy all the rows.
            keepRenderedRows: true
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    }
    goToPage(page) {
        if (!this.active || this.currentPage === page || typeof this.currentPage !== 'number') {
            return;
        }
        this.currentPage = page;
        const event = {
            type: events_1.Events.EVENT_MODEL_UPDATED,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: true
        };
        this.onModelUpdated(event);
    }
    getPixelOffset() {
        return this.pixelOffset;
    }
    getRow(index) {
        return this.rowModel.getRow(index);
    }
    getRowNode(id) {
        return this.rowModel.getRowNode(id);
    }
    getRowIndexAtPixel(pixel) {
        return this.rowModel.getRowIndexAtPixel(pixel);
    }
    getCurrentPageHeight() {
        if (generic_1.missing(this.topRowBounds) || generic_1.missing(this.bottomRowBounds)) {
            return 0;
        }
        return Math.max(this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight - this.topRowBounds.rowTop, 0);
    }
    getCurrentPagePixelRange() {
        const pageFirstPixel = this.topRowBounds ? this.topRowBounds.rowTop : 0;
        const pageLastPixel = this.bottomRowBounds ? this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight : 0;
        return { pageFirstPixel, pageLastPixel };
    }
    isRowPresent(rowNode) {
        if (!this.rowModel.isRowPresent(rowNode)) {
            return false;
        }
        const nodeIsInPage = rowNode.rowIndex >= this.topDisplayedRowIndex && rowNode.rowIndex <= this.bottomDisplayedRowIndex;
        return nodeIsInPage;
    }
    isEmpty() {
        return this.rowModel.isEmpty();
    }
    isRowsToRender() {
        return this.rowModel.isRowsToRender();
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        return this.rowModel.getNodesInRangeForSelection(firstInRange, lastInRange);
    }
    forEachNode(callback) {
        return this.rowModel.forEachNode(callback);
    }
    getType() {
        return this.rowModel.getType();
    }
    getRowBounds(index) {
        const res = this.rowModel.getRowBounds(index);
        res.rowIndex = index;
        return res;
    }
    getPageFirstRow() {
        return this.topRowBounds ? this.topRowBounds.rowIndex : -1;
    }
    getPageLastRow() {
        return this.bottomRowBounds ? this.bottomRowBounds.rowIndex : -1;
    }
    getRowCount() {
        return this.rowModel.getRowCount();
    }
    getPageForIndex(index) {
        return Math.floor(index / this.pageSize);
    }
    goToPageWithIndex(index) {
        if (!this.active) {
            return;
        }
        const pageNumber = this.getPageForIndex(index);
        this.goToPage(pageNumber);
    }
    isRowInPage(row) {
        if (!this.active) {
            return true;
        }
        const rowPage = this.getPageForIndex(row.rowIndex);
        return rowPage === this.currentPage;
    }
    isLastPageFound() {
        return this.rowModel.isLastRowIndexKnown();
    }
    getCurrentPage() {
        return this.currentPage;
    }
    goToNextPage() {
        this.goToPage(this.currentPage + 1);
    }
    goToPreviousPage() {
        this.goToPage(this.currentPage - 1);
    }
    goToFirstPage() {
        this.goToPage(0);
    }
    goToLastPage() {
        const rowCount = this.rowModel.getRowCount();
        const lastPage = Math.floor(rowCount / this.pageSize);
        this.goToPage(lastPage);
    }
    getPageSize() {
        return this.pageSize;
    }
    getTotalPages() {
        return this.totalPages;
    }
    setPageSize() {
        // show put this into super class
        this.pageSize = this.gridOptionsService.getNum('paginationPageSize');
        if (this.pageSize == null || this.pageSize < 1) {
            this.pageSize = 100;
        }
    }
    calculatePages() {
        if (this.active) {
            this.setPageSize();
            if (this.paginateChildRows) {
                this.calculatePagesAllRows();
            }
            else {
                this.calculatePagesMasterRowsOnly();
            }
        }
        else {
            this.calculatedPagesNotActive();
        }
        this.topRowBounds = this.rowModel.getRowBounds(this.topDisplayedRowIndex);
        if (this.topRowBounds) {
            this.topRowBounds.rowIndex = this.topDisplayedRowIndex;
        }
        this.bottomRowBounds = this.rowModel.getRowBounds(this.bottomDisplayedRowIndex);
        if (this.bottomRowBounds) {
            this.bottomRowBounds.rowIndex = this.bottomDisplayedRowIndex;
        }
        this.setPixelOffset(generic_1.exists(this.topRowBounds) ? this.topRowBounds.rowTop : 0);
    }
    setPixelOffset(value) {
        if (this.pixelOffset === value) {
            return;
        }
        this.pixelOffset = value;
        this.eventService.dispatchEvent({ type: events_1.Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED });
    }
    setZeroRows() {
        this.masterRowCount = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = -1;
        this.currentPage = 0;
        this.totalPages = 0;
    }
    adjustCurrentPageIfInvalid() {
        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages - 1;
        }
        if (!isFinite(this.currentPage) || isNaN(this.currentPage) || this.currentPage < 0) {
            this.currentPage = 0;
        }
    }
    calculatePagesMasterRowsOnly() {
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
        }
        else {
            const firstIndexNotToShow = this.rowModel.getTopLevelRowDisplayedIndex(masterPageEndIndex + 1);
            //masterRows[masterPageEndIndex + 1].rowIndex;
            // this gets the index of the last child - eg current row is open, we want to display all children,
            // the index of the last child is one less than the index of the next parent row.
            this.bottomDisplayedRowIndex = firstIndexNotToShow - 1;
        }
    }
    getMasterRowCount() {
        return this.masterRowCount;
    }
    calculatePagesAllRows() {
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
    calculatedPagesNotActive() {
        this.pageSize = this.rowModel.getRowCount();
        this.totalPages = 1;
        this.currentPage = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = this.rowModel.getRowCount() - 1;
    }
};
__decorate([
    context_1.Autowired('rowModel')
], PaginationProxy.prototype, "rowModel", void 0);
__decorate([
    context_1.PostConstruct
], PaginationProxy.prototype, "postConstruct", null);
PaginationProxy = __decorate([
    context_1.Bean('paginationProxy')
], PaginationProxy);
exports.PaginationProxy = PaginationProxy;
