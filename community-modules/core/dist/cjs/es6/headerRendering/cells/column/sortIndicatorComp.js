/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.SortIndicatorComp = void 0;
const eventKeys_1 = require("../../../eventKeys");
const dom_1 = require("../../../utils/dom");
const context_1 = require("../../../context/context");
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const component_1 = require("../../../widgets/component");
const icon_1 = require("../../../utils/icon");
class SortIndicatorComp extends component_1.Component {
    constructor(skipTemplate) {
        super();
        if (!skipTemplate) {
            this.setTemplate(SortIndicatorComp.TEMPLATE);
        }
    }
    attachCustomElements(eSortOrder, eSortAsc, eSortDesc, eSortMixed, eSortNone) {
        this.eSortOrder = eSortOrder;
        this.eSortAsc = eSortAsc;
        this.eSortDesc = eSortDesc;
        this.eSortMixed = eSortMixed;
        this.eSortNone = eSortNone;
    }
    setupSort(column, suppressOrder = false) {
        this.column = column;
        this.suppressOrder = suppressOrder;
        this.setupMultiSortIndicator();
        const canSort = !!this.column.getColDef().sortable;
        if (!canSort) {
            return;
        }
        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);
        // Watch global events, as row group columns can effect their display column.
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, () => this.onSortChanged());
        // when grouping changes so can sort indexes and icons
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onSortChanged());
        this.onSortChanged();
    }
    addInIcon(iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        const eIcon = icon_1.createIconNoSpan(iconName, this.gridOptionsService, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }
    onSortChanged() {
        this.updateIcons();
        if (!this.suppressOrder) {
            this.updateSortOrder();
        }
    }
    updateIcons() {
        const sortDirection = this.sortController.getDisplaySortForColumn(this.column);
        if (this.eSortAsc) {
            const isAscending = sortDirection === 'asc';
            dom_1.setDisplayed(this.eSortAsc, isAscending, { skipAriaHidden: true });
        }
        if (this.eSortDesc) {
            const isDescending = sortDirection === 'desc';
            dom_1.setDisplayed(this.eSortDesc, isDescending, { skipAriaHidden: true });
        }
        if (this.eSortNone) {
            const alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsService.is('unSortIcon');
            const isNone = sortDirection === null || sortDirection === undefined;
            dom_1.setDisplayed(this.eSortNone, !alwaysHideNoSort && isNone, { skipAriaHidden: true });
        }
    }
    setupMultiSortIndicator() {
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);
        const isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        const areGroupsCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, () => this.updateMultiSortIndicator());
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.updateMultiSortIndicator());
            this.updateMultiSortIndicator();
        }
    }
    updateMultiSortIndicator() {
        if (this.eSortMixed) {
            const isMixedSort = this.sortController.getDisplaySortForColumn(this.column) === 'mixed';
            dom_1.setDisplayed(this.eSortMixed, isMixedSort, { skipAriaHidden: true });
        }
    }
    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    updateSortOrder() {
        var _a;
        if (!this.eSortOrder) {
            return;
        }
        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        const indexThisCol = (_a = this.sortController.getDisplaySortIndexForColumn(this.column)) !== null && _a !== void 0 ? _a : -1;
        const moreThanOneColSorting = allColumnsWithSorting.some(col => { var _a; return (_a = this.sortController.getDisplaySortIndexForColumn(col)) !== null && _a !== void 0 ? _a : -1 >= 1; });
        const showIndex = indexThisCol >= 0 && moreThanOneColSorting;
        dom_1.setDisplayed(this.eSortOrder, showIndex, { skipAriaHidden: true });
        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        }
        else {
            dom_1.clearElement(this.eSortOrder);
        }
    }
}
SortIndicatorComp.TEMPLATE = `<span class="ag-sort-indicator-container">
            <span ref="eSortOrder" class="ag-sort-indicator-icon ag-sort-order ag-hidden" aria-hidden="true"></span>
            <span ref="eSortAsc" class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortDesc" class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortMixed" class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" aria-hidden="true"></span>
            <span ref="eSortNone" class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" aria-hidden="true"></span>
        </span>`;
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
exports.SortIndicatorComp = SortIndicatorComp;
