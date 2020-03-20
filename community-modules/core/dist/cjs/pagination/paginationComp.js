/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var events_1 = require("../events");
var utils_1 = require("../utils");
var constants_1 = require("../constants");
var PaginationComp = /** @class */ (function (_super) {
    __extends(PaginationComp, _super);
    function PaginationComp() {
        var _this = _super.call(this) || this;
        _this.previousAndFirstButtonsDisabled = false;
        _this.nextButtonDisabled = false;
        _this.lastButtonDisabled = false;
        return _this;
    }
    PaginationComp.prototype.postConstruct = function () {
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', utils_1._.createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper));
        this.btPrevious.insertAdjacentElement('afterbegin', utils_1._.createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper));
        this.btNext.insertAdjacentElement('afterbegin', utils_1._.createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper));
        this.btLast.insertAdjacentElement('afterbegin', utils_1._.createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper));
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            this.serverSideRowModel = this.rowModel;
        }
        var isPaging = this.gridOptionsWrapper.isPagination();
        var paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.setDisplayed(false);
            return;
        }
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
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
            return utils_1._.formatNumberCommas(value);
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
        return "<div class=\"ag-paging-panel ag-unselectable\">\n                <span ref=\"eSummaryPanel\" class=\"ag-paging-row-summary-panel\">\n                    <span ref=\"lbFirstRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    " + strTo + "\n                    <span ref=\"lbLastRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    " + strOf + "\n                    <span ref=\"lbRecordCount\" class=\"ag-paging-row-summary-panel-number\"></span>\n                </span>\n                <span class=\"ag-paging-page-summary-panel\">\n                    <div ref=\"btFirst\" class=\"ag-paging-button-wrapper\">\n                        <button type=\"button\" class=\"ag-paging-button\">" + strFirst + "</button>\n                    </div>\n                    <div ref=\"btPrevious\" class=\"ag-paging-button-wrapper\">\n                        <button type=\"button\" class=\"ag-paging-button\">" + strPrevious + "</button>\n                    </div>\n                    <span class=\"ag-paging-description\">\n                        " + strPage + "\n                        <span ref=\"lbCurrent\" class=\"ag-paging-number\"></span>\n                        " + strOf + "\n                        <span ref=\"lbTotal\" class=\"ag-paging-number\"></span>\n                    </span>\n                    <span ref=\"lbTotal\" class=\"ag-paging-number\"></span>\n                    <div ref=\"btNext\" class=\"ag-paging-button-wrapper\">\n                        <button type=\"button\" class=\"ag-paging-button\">" + strNext + "</button>\n                    </div>\n                    <div ref=\"btLast\" class=\"ag-paging-button-wrapper\">\n                        <button type=\"button\" class=\"ag-paging-button\">" + strLast + "</button>\n                    </div>\n                </span>\n            </div>";
    };
    PaginationComp.prototype.onBtNext = function () {
        if (!this.nextButtonDisabled) {
            this.paginationProxy.goToNextPage();
        }
    };
    PaginationComp.prototype.onBtPrevious = function () {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationProxy.goToPreviousPage();
        }
    };
    PaginationComp.prototype.onBtFirst = function () {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationProxy.goToFirstPage();
        }
    };
    PaginationComp.prototype.onBtLast = function () {
        if (!this.lastButtonDisabled) {
            this.paginationProxy.goToLastPage();
        }
    };
    PaginationComp.prototype.enableOrDisableButtons = function () {
        var currentPage = this.paginationProxy.getCurrentPage();
        var maxRowFound = this.paginationProxy.isLastPageFound();
        var totalPages = this.paginationProxy.getTotalPages();
        this.previousAndFirstButtonsDisabled = currentPage === 0;
        utils_1._.addOrRemoveCssClass(this.btPrevious, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        utils_1._.addOrRemoveCssClass(this.btFirst, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = maxRowFound && currentPage === (totalPages - 1);
        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        utils_1._.addOrRemoveCssClass(this.btNext, 'ag-disabled', this.nextButtonDisabled);
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        utils_1._.addOrRemoveCssClass(this.btLast, 'ag-disabled', this.lastButtonDisabled);
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
        context_1.Autowired('gridOptionsWrapper')
    ], PaginationComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], PaginationComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], PaginationComp.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], PaginationComp.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], PaginationComp.prototype, "rowModel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('btFirst')
    ], PaginationComp.prototype, "btFirst", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('btPrevious')
    ], PaginationComp.prototype, "btPrevious", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('btNext')
    ], PaginationComp.prototype, "btNext", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('btLast')
    ], PaginationComp.prototype, "btLast", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('lbRecordCount')
    ], PaginationComp.prototype, "lbRecordCount", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('lbFirstRowOnPage')
    ], PaginationComp.prototype, "lbFirstRowOnPage", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('lbLastRowOnPage')
    ], PaginationComp.prototype, "lbLastRowOnPage", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSummaryPanel')
    ], PaginationComp.prototype, "eSummaryPanel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('lbCurrent')
    ], PaginationComp.prototype, "lbCurrent", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('lbTotal')
    ], PaginationComp.prototype, "lbTotal", void 0);
    __decorate([
        context_1.PostConstruct
    ], PaginationComp.prototype, "postConstruct", null);
    return PaginationComp;
}(component_1.Component));
exports.PaginationComp = PaginationComp;

//# sourceMappingURL=paginationComp.js.map
