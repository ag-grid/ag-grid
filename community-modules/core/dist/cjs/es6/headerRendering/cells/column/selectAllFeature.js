/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const agCheckbox_1 = require("../../../widgets/agCheckbox");
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
const events_1 = require("../../../events");
const constants_1 = require("../../../constants/constants");
const aria_1 = require("../../../utils/aria");
class SelectAllFeature extends beanStub_1.BeanStub {
    constructor(column) {
        super();
        this.cbSelectAllVisible = false;
        this.processingEventFromCheckbox = false;
        this.column = column;
        const colDef = column.getColDef();
        this.filteredOnly = colDef ? !!colDef.headerCheckboxSelectionFilteredOnly : false;
    }
    onSpaceKeyPressed(e) {
        const checkbox = this.cbSelectAll;
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (checkbox.isDisplayed() && !checkbox.getGui().contains(eDocument.activeElement)) {
            e.preventDefault();
            checkbox.setValue(!checkbox.getValue());
        }
    }
    getCheckboxGui() {
        return this.cbSelectAll.getGui();
    }
    setComp(ctrl) {
        this.headerCellCtrl = ctrl;
        this.cbSelectAll = this.createManagedBean(new agCheckbox_1.AgCheckbox());
        this.cbSelectAll.addCssClass('ag-header-select-all');
        aria_1.setAriaRole(this.cbSelectAll.getGui(), 'presentation');
        this.showOrHideSelectAll();
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addManagedListener(this.cbSelectAll, agCheckbox_1.AgCheckbox.EVENT_CHANGED, this.onCbSelectAll.bind(this));
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    }
    showOrHideSelectAll() {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setDisplayed(this.cbSelectAllVisible);
        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType();
            // make sure checkbox is showing the right state
            this.updateStateOfCheckbox();
        }
        this.refreshSelectAllLabel();
    }
    onModelChanged() {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    }
    onSelectionChanged() {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    }
    getNextCheckboxState(selectionCount) {
        // if no rows, always have it unselected
        if (selectionCount.selected === 0 && selectionCount.notSelected === 0) {
            return false;
        }
        // if mix of selected and unselected, this is the tri-state
        if (selectionCount.selected > 0 && selectionCount.notSelected > 0) {
            return null;
        }
        // only selected
        if (selectionCount.selected > 0) {
            return true;
        }
        // nothing selected
        return false;
    }
    updateStateOfCheckbox() {
        if (this.processingEventFromCheckbox) {
            return;
        }
        this.processingEventFromCheckbox = true;
        const selectionCount = this.getSelectionCount();
        const allSelected = this.getNextCheckboxState(selectionCount);
        this.cbSelectAll.setValue(allSelected);
        this.refreshSelectAllLabel();
        this.processingEventFromCheckbox = false;
    }
    refreshSelectAllLabel() {
        if (!this.cbSelectAllVisible) {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', null);
        }
        else {
            const translate = this.gridOptionsWrapper.getLocaleTextFunc();
            const checked = this.cbSelectAll.getValue();
            const ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
            const ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', `${ariaLabel} (${ariaStatus})`);
        }
        this.headerCellCtrl.refreshAriaDescription();
    }
    getSelectionCount() {
        let selectedCount = 0;
        let notSelectedCount = 0;
        const callback = (node) => {
            if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                return;
            }
            if (node.isSelected()) {
                selectedCount++;
            }
            else if (!node.selectable) {
                // don't count non-selectable nodes!
            }
            else {
                notSelectedCount++;
            }
        };
        if (this.filteredOnly) {
            this.gridApi.forEachNodeAfterFilter(callback);
        }
        else {
            this.gridApi.forEachNode(callback);
        }
        return {
            notSelected: notSelectedCount,
            selected: selectedCount
        };
    }
    checkRightRowModelType() {
        const rowModelType = this.rowModel.getType();
        const rowModelMatches = rowModelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        if (!rowModelMatches) {
            console.warn(`AG Grid: selectAllCheckbox is only available if using normal row model, you are using ${rowModelType}`);
        }
    }
    onCbSelectAll() {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }
        const value = this.cbSelectAll.getValue();
        if (value) {
            this.selectionService.selectAllRowNodes(this.filteredOnly);
        }
        else {
            this.selectionService.deselectAllRowNodes(this.filteredOnly);
        }
    }
    isCheckboxSelection() {
        let result = this.column.getColDef().headerCheckboxSelection;
        if (typeof result === 'function') {
            const func = result;
            const params = {
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.columnApi,
                api: this.gridApi,
                context: this.gridOptionsWrapper.getContext()
            };
            result = func(params);
        }
        if (result) {
            if (this.gridOptionsWrapper.isRowModelServerSide()) {
                console.warn('AG Grid: headerCheckboxSelection is not supported for Server Side Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelInfinite()) {
                console.warn('AG Grid: headerCheckboxSelection is not supported for Infinite Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelViewport()) {
                console.warn('AG Grid: headerCheckboxSelection is not supported for Viewport Row Model');
                return false;
            }
            // otherwise the row model is compatible, so return true
            return true;
        }
        return false;
    }
}
__decorate([
    context_1.Autowired('gridApi')
], SelectAllFeature.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi')
], SelectAllFeature.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('rowModel')
], SelectAllFeature.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('selectionService')
], SelectAllFeature.prototype, "selectionService", void 0);
exports.SelectAllFeature = SelectAllFeature;
