/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
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
import { Component } from "../widgets/component";
import { Autowired, PostConstruct } from "../context/context";
import { RefSelector } from "../widgets/componentAnnotations";
import { Events } from "../events";
import { _ } from "../utils";
import { Constants } from "../constants";
var PaginationComp = /** @class */ (function (_super) {
    __extends(PaginationComp, _super);
    function PaginationComp() {
        return _super.call(this) || this;
    }
    PaginationComp.prototype.postConstruct = function () {
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper));
        this.btPrevious.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper));
        this.btNext.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper));
        this.btLast.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper));
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            this.serverSideRowModel = this.rowModel;
        }
        var isPaging = this.gridOptionsWrapper.isPagination();
        var paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.setDisplayed(false);
            return;
        }
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));
        this.onPaginationChanged();
    };
    PaginationComp.prototype.onPaginationChanged = function () {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    };
    PaginationComp.prototype.setCurrentPageLabel = function () {
        var pagesExist = this.paginationProxy.getTotalPages() > 0;
        var currentPage = this.paginationProxy.getCurrentPage();
        var toDisplay = pagesExist ? currentPage + 1 : 0;
        this.lbCurrent.innerHTML = this.formatNumber(toDisplay);
    };
    PaginationComp.prototype.formatNumber = function (value) {
        var userFunc = this.gridOptionsWrapper.getPaginationNumberFormatterFunc();
        if (userFunc) {
            return userFunc({ value: value });
        }
        else {
            return _.formatNumberCommas(value);
        }
    };
    PaginationComp.prototype.getTemplate = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var strPage = localeTextFunc('page', 'Page');
        var strTo = localeTextFunc('to', 'to');
        var strOf = localeTextFunc('of', 'of');
        var strFirst = localeTextFunc('first', 'First');
        var strPrevious = localeTextFunc('previous', 'Previous');
        var strNext = localeTextFunc('next', 'Next');
        var strLast = localeTextFunc('last', 'Last');
        return "<div class=\"ag-paging-panel ag-unselectable\">\n                <span ref=\"eSummaryPanel\" class=\"ag-paging-row-summary-panel\">\n                    <span ref=\"lbFirstRowOnPage\"></span> " + strTo + " <span ref=\"lbLastRowOnPage\"></span> " + strOf + " <span ref=\"lbRecordCount\"></span>\n                </span>\n                <span class=\"ag-paging-page-summary-panel\">\n                    <div ref=\"btFirst\" class=\"ag-paging-button\">\n                        <button type=\"button\">" + strFirst + "</button>\n                    </div>\n                    <div ref=\"btPrevious\" class=\"ag-paging-button\">\n                        <button type=\"button\">" + strPrevious + "</button>\n                    </div>\n                    " + strPage + " <span ref=\"lbCurrent\"></span> " + strOf + " <span ref=\"lbTotal\"></span>\n                    <div ref=\"btNext\" class=\"ag-paging-button\">\n                        <button type=\"button\">" + strNext + "</button>\n                    </div>\n                    <div ref=\"btLast\" class=\"ag-paging-button\">\n                        <button type=\"button\">" + strLast + "</button>\n                    </div>\n                </span>\n            </div>";
    };
    PaginationComp.prototype.onBtNext = function () {
        this.paginationProxy.goToNextPage();
    };
    PaginationComp.prototype.onBtPrevious = function () {
        this.paginationProxy.goToPreviousPage();
    };
    PaginationComp.prototype.onBtFirst = function () {
        this.paginationProxy.goToFirstPage();
    };
    PaginationComp.prototype.onBtLast = function () {
        this.paginationProxy.goToLastPage();
    };
    PaginationComp.prototype.enableOrDisableButtons = function () {
        var currentPage = this.paginationProxy.getCurrentPage();
        var maxRowFound = this.paginationProxy.isLastPageFound();
        var totalPages = this.paginationProxy.getTotalPages();
        var disablePreviousAndFirst = currentPage === 0;
        _.addOrRemoveCssClass(this.btPrevious, 'ag-disabled', disablePreviousAndFirst);
        _.addOrRemoveCssClass(this.btFirst, 'ag-disabled', disablePreviousAndFirst);
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = maxRowFound && currentPage === (totalPages - 1);
        var disableNext = onLastPage || zeroPagesToDisplay;
        _.addOrRemoveCssClass(this.btNext, 'ag-disabled', disableNext);
        var disableLast = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        _.addOrRemoveCssClass(this.btLast, 'ag-disabled', disableLast);
    };
    PaginationComp.prototype.updateRowLabels = function () {
        var currentPage = this.paginationProxy.getCurrentPage();
        var pageSize = this.paginationProxy.getPageSize();
        var maxRowFound = this.paginationProxy.isLastPageFound();
        var rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getMasterRowCount() : null;
        var startRow;
        var endRow;
        if (this.isZeroPagesToDisplay()) {
            startRow = 0;
            endRow = 0;
        }
        else {
            startRow = (pageSize * currentPage) + 1;
            endRow = startRow + pageSize - 1;
            if (maxRowFound && endRow > rowCount) {
                endRow = rowCount;
            }
        }
        this.lbFirstRowOnPage.innerHTML = this.formatNumber(startRow);
        if (this.serverSideRowModel && this.serverSideRowModel.isLoading()) {
            this.lbLastRowOnPage.innerHTML = '?';
        }
        else {
            this.lbLastRowOnPage.innerHTML = this.formatNumber(endRow);
        }
    };
    PaginationComp.prototype.isZeroPagesToDisplay = function () {
        var maxRowFound = this.paginationProxy.isLastPageFound();
        var totalPages = this.paginationProxy.getTotalPages();
        return maxRowFound && totalPages === 0;
    };
    PaginationComp.prototype.setTotalLabels = function () {
        var lastPageFound = this.paginationProxy.isLastPageFound();
        var totalPages = this.paginationProxy.getTotalPages();
        var rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getMasterRowCount() : null;
        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount);
        }
        else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], PaginationComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('eventService')
    ], PaginationComp.prototype, "eventService", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], PaginationComp.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], PaginationComp.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('rowModel')
    ], PaginationComp.prototype, "rowModel", void 0);
    __decorate([
        RefSelector('btFirst')
    ], PaginationComp.prototype, "btFirst", void 0);
    __decorate([
        RefSelector('btPrevious')
    ], PaginationComp.prototype, "btPrevious", void 0);
    __decorate([
        RefSelector('btNext')
    ], PaginationComp.prototype, "btNext", void 0);
    __decorate([
        RefSelector('btLast')
    ], PaginationComp.prototype, "btLast", void 0);
    __decorate([
        RefSelector('lbRecordCount')
    ], PaginationComp.prototype, "lbRecordCount", void 0);
    __decorate([
        RefSelector('lbFirstRowOnPage')
    ], PaginationComp.prototype, "lbFirstRowOnPage", void 0);
    __decorate([
        RefSelector('lbLastRowOnPage')
    ], PaginationComp.prototype, "lbLastRowOnPage", void 0);
    __decorate([
        RefSelector('eSummaryPanel')
    ], PaginationComp.prototype, "eSummaryPanel", void 0);
    __decorate([
        RefSelector('lbCurrent')
    ], PaginationComp.prototype, "lbCurrent", void 0);
    __decorate([
        RefSelector('lbTotal')
    ], PaginationComp.prototype, "lbTotal", void 0);
    __decorate([
        PostConstruct
    ], PaginationComp.prototype, "postConstruct", null);
    return PaginationComp;
}(Component));
export { PaginationComp };
