/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { missing, exists } from "../utils/generic";
import { isNumeric } from "../utils/number";
var PaginationProxy = /** @class */ (function (_super) {
    __extends(PaginationProxy, _super);
    function PaginationProxy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.currentPage = 0;
        _this.topDisplayedRowIndex = 0;
        _this.bottomDisplayedRowIndex = 0;
        _this.pixelOffset = 0;
        _this.masterRowCount = 0;
        return _this;
    }
    PaginationProxy.prototype.postConstruct = function () {
        this.active = this.gridOptionsWrapper.isPagination();
        this.paginateChildRows = this.gridOptionsWrapper.isPaginateChildRows();
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, 'paginationPageSize', this.onPaginationPageSizeChanged.bind(this));
        this.onModelUpdated();
    };
    PaginationProxy.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        var res = this.rowModel.ensureRowHeightsValid(startPixel, endPixel, this.getPageFirstRow(), this.getPageLastRow());
        if (res) {
            this.calculatePages();
        }
        return res;
    };
    PaginationProxy.prototype.onModelUpdated = function (modelUpdatedEvent) {
        this.calculatePages();
        var paginationChangedEvent = {
            type: Events.EVENT_PAGINATION_CHANGED,
            animate: modelUpdatedEvent ? modelUpdatedEvent.animate : false,
            newData: modelUpdatedEvent ? modelUpdatedEvent.newData : false,
            newPage: modelUpdatedEvent ? modelUpdatedEvent.newPage : false,
            keepRenderedRows: modelUpdatedEvent ? modelUpdatedEvent.keepRenderedRows : false,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    };
    PaginationProxy.prototype.onPaginationPageSizeChanged = function () {
        this.calculatePages();
        var paginationChangedEvent = {
            type: Events.EVENT_PAGINATION_CHANGED,
            animate: false,
            newData: false,
            newPage: false,
            // important to keep rendered rows, otherwise every time grid is resized,
            // we would destroy all the rows.
            keepRenderedRows: true,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(paginationChangedEvent);
    };
    PaginationProxy.prototype.goToPage = function (page) {
        if (!this.active || this.currentPage === page) {
            return;
        }
        this.currentPage = page;
        var event = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: false,
            keepRenderedRows: false,
            newData: false,
            newPage: true,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.onModelUpdated(event);
    };
    PaginationProxy.prototype.getPixelOffset = function () {
        return this.pixelOffset;
    };
    PaginationProxy.prototype.getRow = function (index) {
        return this.rowModel.getRow(index);
    };
    PaginationProxy.prototype.getRowNode = function (id) {
        return this.rowModel.getRowNode(id);
    };
    PaginationProxy.prototype.getRowIndexAtPixel = function (pixel) {
        return this.rowModel.getRowIndexAtPixel(pixel);
    };
    PaginationProxy.prototype.getCurrentPageHeight = function () {
        if (missing(this.topRowBounds) || missing(this.bottomRowBounds)) {
            return 0;
        }
        return Math.max(this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight - this.topRowBounds.rowTop, 0);
    };
    PaginationProxy.prototype.getCurrentPagePixelRange = function () {
        var pageFirstPixel = this.topRowBounds ? this.topRowBounds.rowTop : 0;
        var pageLastPixel = this.bottomRowBounds ? this.bottomRowBounds.rowTop + this.bottomRowBounds.rowHeight : 0;
        return { pageFirstPixel: pageFirstPixel, pageLastPixel: pageLastPixel };
    };
    PaginationProxy.prototype.isRowPresent = function (rowNode) {
        if (!this.rowModel.isRowPresent(rowNode)) {
            return false;
        }
        var nodeIsInPage = rowNode.rowIndex >= this.topDisplayedRowIndex && rowNode.rowIndex <= this.bottomDisplayedRowIndex;
        return nodeIsInPage;
    };
    PaginationProxy.prototype.isEmpty = function () {
        return this.rowModel.isEmpty();
    };
    PaginationProxy.prototype.isRowsToRender = function () {
        return this.rowModel.isRowsToRender();
    };
    PaginationProxy.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        return this.rowModel.getNodesInRangeForSelection(firstInRange, lastInRange);
    };
    PaginationProxy.prototype.forEachNode = function (callback) {
        return this.rowModel.forEachNode(callback);
    };
    PaginationProxy.prototype.getType = function () {
        return this.rowModel.getType();
    };
    PaginationProxy.prototype.getRowBounds = function (index) {
        var res = this.rowModel.getRowBounds(index);
        res.rowIndex = index;
        return res;
    };
    PaginationProxy.prototype.getPageFirstRow = function () {
        return this.topRowBounds ? this.topRowBounds.rowIndex : -1;
    };
    PaginationProxy.prototype.getPageLastRow = function () {
        return this.bottomRowBounds ? this.bottomRowBounds.rowIndex : -1;
    };
    PaginationProxy.prototype.getRowCount = function () {
        return this.rowModel.getRowCount();
    };
    PaginationProxy.prototype.getPageForIndex = function (index) {
        return Math.floor(index / this.pageSize);
    };
    PaginationProxy.prototype.goToPageWithIndex = function (index) {
        if (!this.active) {
            return;
        }
        var pageNumber = this.getPageForIndex(index);
        this.goToPage(pageNumber);
    };
    PaginationProxy.prototype.isRowInPage = function (row) {
        if (!this.active) {
            return true;
        }
        var rowPage = this.getPageForIndex(row.rowIndex);
        return rowPage === this.currentPage;
    };
    PaginationProxy.prototype.isLastPageFound = function () {
        return this.rowModel.isLastRowIndexKnown();
    };
    PaginationProxy.prototype.getCurrentPage = function () {
        return this.currentPage;
    };
    PaginationProxy.prototype.goToNextPage = function () {
        this.goToPage(this.currentPage + 1);
    };
    PaginationProxy.prototype.goToPreviousPage = function () {
        this.goToPage(this.currentPage - 1);
    };
    PaginationProxy.prototype.goToFirstPage = function () {
        this.goToPage(0);
    };
    PaginationProxy.prototype.goToLastPage = function () {
        var rowCount = this.rowModel.getRowCount();
        var lastPage = Math.floor(rowCount / this.pageSize);
        this.goToPage(lastPage);
    };
    PaginationProxy.prototype.getPageSize = function () {
        return this.pageSize;
    };
    PaginationProxy.prototype.getTotalPages = function () {
        return this.totalPages;
    };
    PaginationProxy.prototype.setPageSize = function () {
        // show put this into super class
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        if (this.pageSize == null || this.pageSize < 1) {
            this.pageSize = 100;
        }
    };
    PaginationProxy.prototype.calculatePages = function () {
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
        this.setPixelOffset(exists(this.topRowBounds) ? this.topRowBounds.rowTop : 0);
    };
    PaginationProxy.prototype.setPixelOffset = function (value) {
        if (this.pixelOffset === value) {
            return;
        }
        this.pixelOffset = value;
        this.eventService.dispatchEvent({ type: Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED });
    };
    PaginationProxy.prototype.setZeroRows = function () {
        this.masterRowCount = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = -1;
        this.currentPage = 0;
        this.totalPages = 0;
    };
    PaginationProxy.prototype.calculatePagesMasterRowsOnly = function () {
        // const csrm = <ClientSideRowModel> this.rowModel;
        // const rootNode = csrm.getRootNode();
        // const masterRows = rootNode.childrenAfterSort;
        this.masterRowCount = this.rowModel.getTopLevelRowCount();
        // we say <=0 (rather than =0) as viewport returns -1 when no rows
        if (this.masterRowCount <= 0) {
            this.setZeroRows();
            return;
        }
        var masterLastRowIndex = this.masterRowCount - 1;
        this.totalPages = Math.floor((masterLastRowIndex) / this.pageSize) + 1;
        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages - 1;
        }
        if (!isNumeric(this.currentPage) || this.currentPage < 0) {
            this.currentPage = 0;
        }
        var masterPageStartIndex = this.pageSize * this.currentPage;
        var masterPageEndIndex = (this.pageSize * (this.currentPage + 1)) - 1;
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
            var firstIndexNotToShow = this.rowModel.getTopLevelRowDisplayedIndex(masterPageEndIndex + 1);
            //masterRows[masterPageEndIndex + 1].rowIndex;
            // this gets the index of the last child - eg current row is open, we want to display all children,
            // the index of the last child is one less than the index of the next parent row.
            this.bottomDisplayedRowIndex = firstIndexNotToShow - 1;
        }
    };
    PaginationProxy.prototype.getMasterRowCount = function () {
        return this.masterRowCount;
    };
    PaginationProxy.prototype.calculatePagesAllRows = function () {
        this.masterRowCount = this.rowModel.getRowCount();
        if (this.masterRowCount === 0) {
            this.setZeroRows();
            return;
        }
        var maxRowIndex = this.masterRowCount - 1;
        this.totalPages = Math.floor((maxRowIndex) / this.pageSize) + 1;
        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages - 1;
        }
        if (!isNumeric(this.currentPage) || this.currentPage < 0) {
            this.currentPage = 0;
        }
        this.topDisplayedRowIndex = this.pageSize * this.currentPage;
        this.bottomDisplayedRowIndex = (this.pageSize * (this.currentPage + 1)) - 1;
        if (this.bottomDisplayedRowIndex > maxRowIndex) {
            this.bottomDisplayedRowIndex = maxRowIndex;
        }
    };
    PaginationProxy.prototype.calculatedPagesNotActive = function () {
        this.pageSize = this.rowModel.getRowCount();
        this.totalPages = 1;
        this.currentPage = 0;
        this.topDisplayedRowIndex = 0;
        this.bottomDisplayedRowIndex = this.rowModel.getRowCount() - 1;
    };
    __decorate([
        Autowired('rowModel')
    ], PaginationProxy.prototype, "rowModel", void 0);
    __decorate([
        Autowired('columnApi')
    ], PaginationProxy.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], PaginationProxy.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], PaginationProxy.prototype, "postConstruct", null);
    PaginationProxy = __decorate([
        Bean('paginationProxy')
    ], PaginationProxy);
    return PaginationProxy;
}(BeanStub));
export { PaginationProxy };
