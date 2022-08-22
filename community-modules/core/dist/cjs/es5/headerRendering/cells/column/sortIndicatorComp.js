/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
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
var eventKeys_1 = require("../../../eventKeys");
var dom_1 = require("../../../utils/dom");
var context_1 = require("../../../context/context");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var component_1 = require("../../../widgets/component");
var icon_1 = require("../../../utils/icon");
var SortIndicatorComp = /** @class */ (function (_super) {
    __extends(SortIndicatorComp, _super);
    function SortIndicatorComp(skipTemplate) {
        var _this = _super.call(this) || this;
        if (!skipTemplate) {
            _this.setTemplate(SortIndicatorComp.TEMPLATE);
        }
        return _this;
    }
    SortIndicatorComp.prototype.attachCustomElements = function (eSortOrder, eSortAsc, eSortDesc, eSortMixed, eSortNone) {
        this.eSortOrder = eSortOrder;
        this.eSortAsc = eSortAsc;
        this.eSortDesc = eSortDesc;
        this.eSortMixed = eSortMixed;
        this.eSortNone = eSortNone;
    };
    SortIndicatorComp.prototype.setupSort = function (column, suppressOrder) {
        var _this = this;
        if (suppressOrder === void 0) { suppressOrder = false; }
        this.column = column;
        this.suppressOrder = suppressOrder;
        this.setupMultiSortIndicator();
        var canSort = !!this.column.getColDef().sortable;
        if (!canSort) {
            return;
        }
        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);
        // Watch global events, as row group columns can effect their display column.
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, function () { return _this.onSortChanged(); });
        // when grouping changes so can sort indexes and icons
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.onSortChanged(); });
        this.onSortChanged();
    };
    SortIndicatorComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = icon_1.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    };
    SortIndicatorComp.prototype.onSortChanged = function () {
        this.updateIcons();
        if (!this.suppressOrder) {
            this.updateSortOrder();
        }
    };
    SortIndicatorComp.prototype.updateIcons = function () {
        var sortDirection = this.sortController.getDisplaySortForColumn(this.column);
        if (this.eSortAsc) {
            var isAscending = sortDirection === 'asc';
            this.eSortAsc.classList.toggle('ag-hidden', !isAscending);
        }
        if (this.eSortDesc) {
            var isDescending = sortDirection === 'desc';
            this.eSortDesc.classList.toggle('ag-hidden', !isDescending);
        }
        if (this.eSortNone) {
            var alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            var isNone = sortDirection === null || sortDirection === undefined;
            this.eSortNone.classList.toggle('ag-hidden', (alwaysHideNoSort || !isNone));
        }
    };
    SortIndicatorComp.prototype.setupMultiSortIndicator = function () {
        var _this = this;
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);
        var isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        var areGroupsCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, function () { return _this.updateMultiSortIndicator(); });
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.updateMultiSortIndicator(); });
            this.updateMultiSortIndicator();
        }
    };
    SortIndicatorComp.prototype.updateMultiSortIndicator = function () {
        if (this.eSortMixed) {
            var isMixedSort = this.sortController.getDisplaySortForColumn(this.column) === 'mixed';
            this.eSortMixed.classList.toggle('ag-hidden', !isMixedSort);
        }
    };
    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    SortIndicatorComp.prototype.updateSortOrder = function () {
        var _this = this;
        var _a;
        if (!this.eSortOrder) {
            return;
        }
        var allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        var indexThisCol = (_a = this.sortController.getDisplaySortIndexForColumn(this.column), (_a !== null && _a !== void 0 ? _a : -1));
        var moreThanOneColSorting = allColumnsWithSorting.some(function (col) { var _a; return _a = _this.sortController.getDisplaySortIndexForColumn(col), (_a !== null && _a !== void 0 ? _a : -1 >= 1); });
        var showIndex = indexThisCol >= 0 && moreThanOneColSorting;
        dom_1.setDisplayed(this.eSortOrder, showIndex);
        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        }
        else {
            dom_1.clearElement(this.eSortOrder);
        }
    };
    SortIndicatorComp.TEMPLATE = "<span class=\"ag-sort-indicator-container\">\n            <span ref=\"eSortOrder\" class=\"ag-sort-indicator-icon ag-sort-order ag-hidden\" aria-hidden=\"true\"></span>\n            <span ref=\"eSortAsc\" class=\"ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden\" aria-hidden=\"true\"></span>\n            <span ref=\"eSortDesc\" class=\"ag-sort-indicator-icon ag-sort-descending-icon ag-hidden\" aria-hidden=\"true\"></span>\n            <span ref=\"eSortMixed\" class=\"ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden\" aria-hidden=\"true\"></span>\n            <span ref=\"eSortNone\" class=\"ag-sort-indicator-icon ag-sort-none-icon ag-hidden\" aria-hidden=\"true\"></span>\n        </span>";
    __decorate([
        componentAnnotations_1.RefSelector('eSortOrder')
    ], SortIndicatorComp.prototype, "eSortOrder", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortAsc')
    ], SortIndicatorComp.prototype, "eSortAsc", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortDesc')
    ], SortIndicatorComp.prototype, "eSortDesc", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortMixed')
    ], SortIndicatorComp.prototype, "eSortMixed", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortNone')
    ], SortIndicatorComp.prototype, "eSortNone", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], SortIndicatorComp.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], SortIndicatorComp.prototype, "sortController", void 0);
    return SortIndicatorComp;
}(component_1.Component));
exports.SortIndicatorComp = SortIndicatorComp;
