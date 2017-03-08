/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var paginationService_1 = require("./paginationService");
var utils_1 = require("../../utils");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var PaginationComp = (function (_super) {
    __extends(PaginationComp, _super);
    function PaginationComp() {
        return _super.call(this) || this;
    }
    PaginationComp.prototype.postConstruct = function () {
        this.setTemplate(this.getTemplate());
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PAGINATION_RESET, this.onPaginationReset.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PAGINATION_PAGE_LOADED, this.onPageLoaded.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PAGINATION_PAGE_REQUESTED, this.onPageRequested.bind(this));
        this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));
    };
    PaginationComp.prototype.onPaginationReset = function () {
        this.showSummaryPanel(false);
        this.setTotalLabels();
    };
    PaginationComp.prototype.showSummaryPanel = function (show) {
        utils_1._.setHidden(this.eSummaryPanel, !show);
    };
    PaginationComp.prototype.onPageRequested = function () {
        this.enableOrDisableButtons();
        var currentPage = this.paginationService.getCurrentPage();
        this.lbCurrent.innerHTML = this.myToLocaleString(currentPage + 1);
    };
    PaginationComp.prototype.onPageLoaded = function () {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        if (this.paginationService.isLastPageFound()) {
            this.setTotalLabels();
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
        return "<div class=\"ag-paging-panel ag-font-style\">\n                <span ref=\"eSummaryPanel\" class=\"ag-paging-row-summary-panel\">\n                    <span ref=\"lbFirstRowOnPage\"></span> " + strTo + " <span ref=\"lbLastRowOnPage\"></span> " + strOf + " <span ref=\"lbRecordCount\"></span>\n                </span>\n                <span class=\"ag-paging-page-summary-panel\">\n                    <button class=\"ag-paging-button\" ref=\"btFirst\">" + strFirst + "</button>\n                    <button class=\"ag-paging-button\" ref=\"btPrevious\">" + strPrevious + "</button>\n                    " + strPage + " <span ref=\"lbCurrent\"></span> " + strOf + " <span ref=\"lbTotal\"></span>\n                    <button class=\"ag-paging-button\" ref=\"btNext\">" + strNext + "</button>\n                    <button class=\"ag-paging-button\" ref=\"btLast\">" + strLast + "</button>\n                </span>\n            </div>";
    };
    PaginationComp.prototype.onBtNext = function () {
        this.paginationService.goToNextPage();
    };
    PaginationComp.prototype.onBtPrevious = function () {
        this.paginationService.goToPreviousPage();
    };
    PaginationComp.prototype.onBtFirst = function () {
        this.paginationService.goToFirstPage();
    };
    PaginationComp.prototype.onBtLast = function () {
        this.paginationService.goToLastPage();
    };
    PaginationComp.prototype.enableOrDisableButtons = function () {
        var currentPage = this.paginationService.getCurrentPage();
        var maxRowFound = this.paginationService.isLastPageFound();
        var totalPages = this.paginationService.getTotalPages();
        var disablePreviousAndFirst = currentPage === 0;
        this.btPrevious.disabled = disablePreviousAndFirst;
        this.btFirst.disabled = disablePreviousAndFirst;
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = maxRowFound && currentPage === (totalPages - 1);
        var disableNext = onLastPage || zeroPagesToDisplay;
        this.btNext.disabled = disableNext;
        var disableLast = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        this.btLast.disabled = disableLast;
    };
    PaginationComp.prototype.updateRowLabels = function () {
        var currentPage = this.paginationService.getCurrentPage();
        var pageSize = this.paginationService.getPageSize();
        var maxRowFound = this.paginationService.isLastPageFound();
        var rowCount = this.paginationService.getRowCount();
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
        this.lbFirstRowOnPage.innerHTML = this.myToLocaleString(startRow);
        this.lbLastRowOnPage.innerHTML = this.myToLocaleString(endRow);
        this.showSummaryPanel(true);
    };
    PaginationComp.prototype.isZeroPagesToDisplay = function () {
        var maxRowFound = this.paginationService.isLastPageFound();
        var totalPages = this.paginationService.getTotalPages();
        return maxRowFound && totalPages === 0;
    };
    PaginationComp.prototype.setTotalLabels = function () {
        var maxRowFound = this.paginationService.isLastPageFound();
        var totalPages = this.paginationService.getTotalPages();
        var rowCount = this.paginationService.getRowCount();
        if (maxRowFound) {
            this.lbTotal.innerHTML = this.myToLocaleString(totalPages);
            this.lbRecordCount.innerHTML = this.myToLocaleString(rowCount);
        }
        else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    };
    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
    PaginationComp.prototype.myToLocaleString = function (input) {
        if (typeof input !== 'number') {
            return '';
        }
        else {
            // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
            return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    };
    return PaginationComp;
}(component_1.Component));
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], PaginationComp.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('paginationService'),
    __metadata("design:type", paginationService_1.PaginationService)
], PaginationComp.prototype, "paginationService", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], PaginationComp.prototype, "eventService", void 0);
__decorate([
    componentAnnotations_1.RefSelector('btFirst'),
    __metadata("design:type", HTMLButtonElement)
], PaginationComp.prototype, "btFirst", void 0);
__decorate([
    componentAnnotations_1.RefSelector('btPrevious'),
    __metadata("design:type", HTMLButtonElement)
], PaginationComp.prototype, "btPrevious", void 0);
__decorate([
    componentAnnotations_1.RefSelector('btNext'),
    __metadata("design:type", HTMLButtonElement)
], PaginationComp.prototype, "btNext", void 0);
__decorate([
    componentAnnotations_1.RefSelector('btLast'),
    __metadata("design:type", HTMLButtonElement)
], PaginationComp.prototype, "btLast", void 0);
__decorate([
    componentAnnotations_1.RefSelector('lbRecordCount'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "lbRecordCount", void 0);
__decorate([
    componentAnnotations_1.RefSelector('lbFirstRowOnPage'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "lbFirstRowOnPage", void 0);
__decorate([
    componentAnnotations_1.RefSelector('lbLastRowOnPage'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "lbLastRowOnPage", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eSummaryPanel'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "eSummaryPanel", void 0);
__decorate([
    componentAnnotations_1.RefSelector('lbCurrent'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "lbCurrent", void 0);
__decorate([
    componentAnnotations_1.RefSelector('lbTotal'),
    __metadata("design:type", Object)
], PaginationComp.prototype, "lbTotal", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaginationComp.prototype, "postConstruct", null);
exports.PaginationComp = PaginationComp;
