/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.PaginationComp = void 0;
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var events_1 = require("../events");
var icon_1 = require("../utils/icon");
var number_1 = require("../utils/number");
var aria_1 = require("../utils/aria");
var keyCode_1 = require("../constants/keyCode");
var PaginationComp = /** @class */ (function (_super) {
    __extends(PaginationComp, _super);
    function PaginationComp() {
        var _this = _super.call(this) || this;
        _this.previousAndFirstButtonsDisabled = false;
        _this.nextButtonDisabled = false;
        _this.lastButtonDisabled = false;
        _this.areListenersSetup = false;
        return _this;
    }
    PaginationComp.prototype.postConstruct = function () {
        var isRtl = this.gridOptionsService.is('enableRtl');
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsService));
        this.btPrevious.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsService));
        this.btNext.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsService));
        this.btLast.insertAdjacentElement('afterbegin', icon_1.createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsService));
        this.addManagedPropertyListener('pagination', this.onPaginationChanged.bind(this));
        this.addManagedPropertyListener('suppressPaginationPanel', this.onPaginationChanged.bind(this));
        this.onPaginationChanged();
    };
    PaginationComp.prototype.onPaginationChanged = function () {
        var isPaging = this.gridOptionsService.is('pagination');
        var paginationPanelEnabled = isPaging && !this.gridOptionsService.is('suppressPaginationPanel');
        this.setDisplayed(paginationPanelEnabled);
        if (!paginationPanelEnabled) {
            return;
        }
        this.setupListeners();
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    };
    PaginationComp.prototype.setupListeners = function () {
        var _this = this;
        if (!this.areListenersSetup) {
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
                    if (e.key === keyCode_1.KeyCode.ENTER || e.key === keyCode_1.KeyCode.SPACE) {
                        e.preventDefault();
                        fn();
                    }
                });
            });
            this.areListenersSetup = true;
        }
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
        var userFunc = this.gridOptionsService.getCallback('paginationNumberFormatter');
        if (userFunc) {
            var params = { value: value };
            return userFunc(params);
        }
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var thousandSeparator = localeTextFunc('thousandSeparator', ',');
        var decimalSeparator = localeTextFunc('decimalSeparator', '.');
        return number_1.formatNumberCommas(value, thousandSeparator, decimalSeparator);
    };
    PaginationComp.prototype.getTemplate = function () {
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var strPage = localeTextFunc('page', 'Page');
        var strTo = localeTextFunc('to', 'to');
        var strOf = localeTextFunc('of', 'of');
        var strFirst = localeTextFunc('firstPage', 'First Page');
        var strPrevious = localeTextFunc('previousPage', 'Previous Page');
        var strNext = localeTextFunc('nextPage', 'Next Page');
        var strLast = localeTextFunc('lastPage', 'Last Page');
        var compId = this.getCompId();
        return /* html */ "<div class=\"ag-paging-panel ag-unselectable\" id=\"ag-" + compId + "\">\n                <span class=\"ag-paging-row-summary-panel\" role=\"status\">\n                    <span id=\"ag-" + compId + "-first-row\" ref=\"lbFirstRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    <span id=\"ag-" + compId + "-to\">" + strTo + "</span>\n                    <span id=\"ag-" + compId + "-last-row\" ref=\"lbLastRowOnPage\" class=\"ag-paging-row-summary-panel-number\"></span>\n                    <span id=\"ag-" + compId + "-of\">" + strOf + "</span>\n                    <span id=\"ag-" + compId + "-row-count\" ref=\"lbRecordCount\" class=\"ag-paging-row-summary-panel-number\"></span>\n                </span>\n                <span class=\"ag-paging-page-summary-panel\" role=\"presentation\">\n                    <div ref=\"btFirst\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strFirst + "\"></div>\n                    <div ref=\"btPrevious\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strPrevious + "\"></div>\n                    <span class=\"ag-paging-description\" role=\"status\">\n                        <span id=\"ag-" + compId + "-start-page\">" + strPage + "</span>\n                        <span id=\"ag-" + compId + "-start-page-number\" ref=\"lbCurrent\" class=\"ag-paging-number\"></span>\n                        <span id=\"ag-" + compId + "-of-page\">" + strOf + "</span>\n                        <span id=\"ag-" + compId + "-of-page-number\" ref=\"lbTotal\" class=\"ag-paging-number\"></span>\n                    </span>\n                    <div ref=\"btNext\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strNext + "\"></div>\n                    <div ref=\"btLast\" class=\"ag-paging-button\" role=\"button\" aria-label=\"" + strLast + "\"></div>\n                </span>\n            </div>";
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
        this.toggleButtonDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);
        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
        var onLastPage = maxRowFound && currentPage === (totalPages - 1);
        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        this.toggleButtonDisabled(this.btNext, this.nextButtonDisabled);
        this.toggleButtonDisabled(this.btLast, this.lastButtonDisabled);
    };
    PaginationComp.prototype.toggleButtonDisabled = function (button, disabled) {
        aria_1.setAriaDisabled(button, disabled);
        button.classList.toggle('ag-disabled', disabled);
        if (disabled) {
            button.removeAttribute('tabindex');
        }
        else {
            button.setAttribute('tabindex', '0');
        }
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
        var rowCount = lastPageFound ? this.paginationProxy.getMasterRowCount() : null;
        // When `pivotMode=true` and no grouping or value columns exist, a single 'hidden' group row (root node) is in
        // the grid and the pagination totals will correctly display total = 1. However this is confusing to users as
        // they can't see it. To address this UX issue we simply set the totals to zero in the pagination panel.
        if (rowCount === 1) {
            var firstRow = this.paginationProxy.getRow(0);
            // a group node with no group or agg data will not be visible to users
            var hiddenGroupRow = firstRow && firstRow.group && !(firstRow.groupData || firstRow.aggData);
            if (hiddenGroupRow) {
                this.setTotalLabelsToZero();
                return;
            }
        }
        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount);
        }
        else {
            var moreText = this.localeService.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    };
    PaginationComp.prototype.setTotalLabelsToZero = function () {
        this.lbFirstRowOnPage.innerHTML = this.formatNumber(0);
        this.lbCurrent.innerHTML = this.formatNumber(0);
        this.lbLastRowOnPage.innerHTML = this.formatNumber(0);
        this.lbTotal.innerHTML = this.formatNumber(0);
        this.lbRecordCount.innerHTML = this.formatNumber(0);
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
