/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var icon_1 = require("../utils/icon");
var number_1 = require("../utils/number");
var dom_1 = require("../utils/dom");
var aria_1 = require("../utils/aria");
var keyCode_1 = require("../constants/keyCode");
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
        var _this = this;
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper));
        this.btPrevious.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper));
        this.btNext.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper));
        this.btLast.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper));
        var isPaging = this.gridOptionsWrapper.isPagination();
        var paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.setDisplayed(false);
            return;
        }
        this.addManagedListener(this.eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        [
            { el: this.btFirst, fn: this.onBtFirst.bind(this) },
            { el: this.btPrevious, fn: this.onBtPrevious.bind(this) },
            { el: this.btNext, fn: this.onBtNext.bind(this) },
            { el: this.btLast, fn: this.onBtLast.bind(this) }
        ].forEach(function (item) {
            var el = item.el, fn = item.fn;
            _this.addManagedListener(el, 'click', fn);
            _this.addManagedListener(el, 'keydown', function (e) {
                if (e.keyCode === keyCode_1.KeyCode.ENTER || e.keyCode === keyCode_1.KeyCode.SPACE) {
                    e.preventDefault();
                    fn();
                }
            });
        });
        this.onPaginationChanged();
    };
    PaginationComp.prototype.onPaginationChanged = function () {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    };
    PaginationComp.prototype.onBtFirst = function () {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationProxy.goToFirstPage();
        }
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
        return number_1.formatNumberCommas(value);
    };
    PaginationComp.prototype.getTemplate = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var strPage = localeTextFunc('page', 'Page');
        var strTo = localeTextFunc('to', 'to');
        var strOf = localeTextFunc('of', 'of');
        var strFirst = localeTextFunc('firstPage', 'First Page');
        var strPrevious = localeTextFunc('previousPage', 'Previous Page');
        var strNext = localeTextFunc('nextPage', 'Next Page');
        var strLast = localeTextFunc('lastPage', 'Last Page');
        var compId = this.getCompId();
        var summaryDescribedBy = "ag-" + compId + "-first-row ag-" + compId + "-to ag-" + compId + "-last-row ag-" + compId + "-of ag-" + compId + "-row-count";
        var descriptionDescribedBy = "ag-" + compId + "-start-page ag-" + compId + "-start-page-number ag-" + compId + "-of-page ag-" + compId + "-of-page-number";
        return /* html */ "<div class=\"ag-paging-panel ag-unselectable\" id=\"ag-" + compId + "\" aria-live=\"polite\" aria-describedby=\"" + descriptionDescribedBy + " " + summaryDescribedBy + "\">\n                <span class=\"ag-paging-row-summary-panel\" aria-hidden=\"true\">\n                    <span id=\"ag-" + compId + "-first-row\" ref=\"lbFirstRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    <span id=\"ag-" + compId + "-to\">" + strTo + "</span>\n                    <span id=\"ag-" + compId + "-last-row\" ref=\"lbLastRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    <span id=\"ag-" + compId + "-of\">" + strOf + "</span>\n                    <span id=\"ag-" + compId + "-row-count\" ref=\"lbRecordCount\" class=\"ag-paging-row-summary-panel-number\"></span>\n                </span>\n                <span class=\"ag-paging-page-summary-panel\" role=\"presentation\">\n                    <div ref=\"btFirst\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strFirst + "\" tabindex=\"0\"></div>\n                    <div ref=\"btPrevious\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strPrevious + "\" tabindex=\"0\"></div>\n                    <span class=\"ag-paging-description\" aria-hidden=\"true\">\n                        <span id=\"ag-" + compId + "-start-page\">" + strPage + "</span>\n                        <span id=\"ag-" + compId + "-start-page-number\" ref=\"lbCurrent\" class=\"ag-paging-number\"></span>\n                        <span id=\"ag-" + compId + "-of-page\">" + strOf + "</span>\n                        <span id=\"ag-" + compId + "-of-page-number\" ref=\"lbTotal\" class=\"ag-paging-number\"></span>\n                    </span>\n                    <div ref=\"btNext\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strNext + "\" tabindex=\"0\"></div>\n                    <div ref=\"btLast\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strLast + "\" tabindex=\"0\"></div>\n                </span>\n            </div>";
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
        dom_1.addOrRemoveCssClass(this.btFirst, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        aria_1.setAriaDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        dom_1.addOrRemoveCssClass(this.btPrevious, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        aria_1.setAriaDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = maxRowFound && currentPage === (totalPages - 1);
        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        dom_1.addOrRemoveCssClass(this.btNext, 'ag-disabled', this.nextButtonDisabled);
        aria_1.setAriaDisabled(this.btNext, this.nextButtonDisabled);
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        dom_1.addOrRemoveCssClass(this.btLast, 'ag-disabled', this.lastButtonDisabled);
        aria_1.setAriaDisabled(this.btLast, this.lastButtonDisabled);
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
            startRow = endRow = 0;
        }
        else {
            startRow = (pageSize * currentPage) + 1;
            endRow = startRow + pageSize - 1;
            if (maxRowFound && endRow > rowCount) {
                endRow = rowCount;
            }
        }
        this.lbFirstRowOnPage.innerHTML = this.formatNumber(startRow);
        if (this.rowNodeBlockLoader.isLoading()) {
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
        var rowCount = lastPageFound ?
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
        context_1.Autowired('paginationProxy')
    ], PaginationComp.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('rowNodeBlockLoader')
    ], PaginationComp.prototype, "rowNodeBlockLoader", void 0);
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
