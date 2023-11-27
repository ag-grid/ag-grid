"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectAllFeature = void 0;
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
const events_1 = require("../../../events");
const aria_1 = require("../../../utils/aria");
const agCheckbox_1 = require("../../../widgets/agCheckbox");
class SelectAllFeature extends beanStub_1.BeanStub {
    constructor(column) {
        super();
        this.cbSelectAllVisible = false;
        this.processingEventFromCheckbox = false;
        this.column = column;
    }
    onSpaceKeyDown(e) {
        const checkbox = this.cbSelectAll;
        const eDocument = this.gridOptionsService.getDocument();
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
        (0, aria_1.setAriaRole)(this.cbSelectAll.getGui(), 'presentation');
        this.showOrHideSelectAll();
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addManagedListener(this.cbSelectAll, events_1.Events.EVENT_FIELD_VALUE_CHANGED, this.onCbSelectAll.bind(this));
        (0, aria_1.setAriaHidden)(this.cbSelectAll.getGui(), true);
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    }
    onNewColumnsLoaded() {
        this.showOrHideSelectAll();
    }
    onDisplayedColumnsChanged() {
        if (!this.isAlive()) {
            return;
        }
        this.showOrHideSelectAll();
    }
    showOrHideSelectAll() {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setDisplayed(this.cbSelectAllVisible, { skipAriaHidden: true });
        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType('selectAllCheckbox');
            // in case user is trying this feature with the wrong model type
            this.checkSelectionType('selectAllCheckbox');
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
    updateStateOfCheckbox() {
        if (this.processingEventFromCheckbox) {
            return;
        }
        this.processingEventFromCheckbox = true;
        const allSelected = this.selectionService.getSelectAllState(this.isFilteredOnly(), this.isCurrentPageOnly());
        this.cbSelectAll.setValue(allSelected);
        this.refreshSelectAllLabel();
        this.processingEventFromCheckbox = false;
    }
    refreshSelectAllLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const checked = this.cbSelectAll.getValue();
        const ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
        const ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');
        if (!this.cbSelectAllVisible) {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', null);
        }
        else {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', `${ariaLabel} (${ariaStatus})`);
        }
        this.cbSelectAll.setInputAriaLabel(`${ariaLabel} (${ariaStatus})`);
        this.headerCellCtrl.refreshAriaDescription();
    }
    checkSelectionType(feature) {
        const isMultiSelect = this.gridOptionsService.get('rowSelection') === 'multiple';
        if (!isMultiSelect) {
            console.warn(`AG Grid: ${feature} is only available if using 'multiple' rowSelection.`);
            return false;
        }
        return true;
    }
    checkRightRowModelType(feature) {
        const rowModelType = this.rowModel.getType();
        const rowModelMatches = rowModelType === 'clientSide' || rowModelType === 'serverSide';
        if (!rowModelMatches) {
            console.warn(`AG Grid: ${feature} is only available if using 'clientSide' or 'serverSide' rowModelType, you are using ${rowModelType}.`);
            return false;
        }
        return true;
    }
    onCbSelectAll() {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }
        const value = this.cbSelectAll.getValue();
        const justFiltered = this.isFilteredOnly();
        const justCurrentPage = this.isCurrentPageOnly();
        let source = 'uiSelectAll';
        if (justCurrentPage) {
            source = 'uiSelectAllCurrentPage';
        }
        else if (justFiltered) {
            source = 'uiSelectAllFiltered';
        }
        const params = {
            source,
            justFiltered,
            justCurrentPage,
        };
        if (value) {
            this.selectionService.selectAllRowNodes(params);
        }
        else {
            this.selectionService.deselectAllRowNodes(params);
        }
    }
    isCheckboxSelection() {
        let result = this.column.getColDef().headerCheckboxSelection;
        if (typeof result === 'function') {
            const func = result;
            const params = {
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.gridOptionsService.columnApi,
                api: this.gridOptionsService.api,
                context: this.gridOptionsService.context
            };
            result = func(params);
        }
        if (result) {
            return this.checkRightRowModelType('headerCheckboxSelection') && this.checkSelectionType('headerCheckboxSelection');
        }
        return false;
    }
    isFilteredOnly() {
        return !!this.column.getColDef().headerCheckboxSelectionFilteredOnly;
    }
    isCurrentPageOnly() {
        return !!this.column.getColDef().headerCheckboxSelectionCurrentPageOnly;
    }
}
__decorate([
    (0, context_1.Autowired)('rowModel')
], SelectAllFeature.prototype, "rowModel", void 0);
__decorate([
    (0, context_1.Autowired)('selectionService')
], SelectAllFeature.prototype, "selectionService", void 0);
exports.SelectAllFeature = SelectAllFeature;
