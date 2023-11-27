"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.SelectAllFeature = void 0;
var beanStub_1 = require("../../../context/beanStub");
var context_1 = require("../../../context/context");
var events_1 = require("../../../events");
var aria_1 = require("../../../utils/aria");
var agCheckbox_1 = require("../../../widgets/agCheckbox");
var SelectAllFeature = /** @class */ (function (_super) {
    __extends(SelectAllFeature, _super);
    function SelectAllFeature(column) {
        var _this = _super.call(this) || this;
        _this.cbSelectAllVisible = false;
        _this.processingEventFromCheckbox = false;
        _this.column = column;
        return _this;
    }
    SelectAllFeature.prototype.onSpaceKeyDown = function (e) {
        var checkbox = this.cbSelectAll;
        var eDocument = this.gridOptionsService.getDocument();
        if (checkbox.isDisplayed() && !checkbox.getGui().contains(eDocument.activeElement)) {
            e.preventDefault();
            checkbox.setValue(!checkbox.getValue());
        }
    };
    SelectAllFeature.prototype.getCheckboxGui = function () {
        return this.cbSelectAll.getGui();
    };
    SelectAllFeature.prototype.setComp = function (ctrl) {
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
    };
    SelectAllFeature.prototype.onNewColumnsLoaded = function () {
        this.showOrHideSelectAll();
    };
    SelectAllFeature.prototype.onDisplayedColumnsChanged = function () {
        if (!this.isAlive()) {
            return;
        }
        this.showOrHideSelectAll();
    };
    SelectAllFeature.prototype.showOrHideSelectAll = function () {
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
    };
    SelectAllFeature.prototype.onModelChanged = function () {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    };
    SelectAllFeature.prototype.onSelectionChanged = function () {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    };
    SelectAllFeature.prototype.updateStateOfCheckbox = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        this.processingEventFromCheckbox = true;
        var allSelected = this.selectionService.getSelectAllState(this.isFilteredOnly(), this.isCurrentPageOnly());
        this.cbSelectAll.setValue(allSelected);
        this.refreshSelectAllLabel();
        this.processingEventFromCheckbox = false;
    };
    SelectAllFeature.prototype.refreshSelectAllLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var checked = this.cbSelectAll.getValue();
        var ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
        var ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');
        if (!this.cbSelectAllVisible) {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', null);
        }
        else {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', "".concat(ariaLabel, " (").concat(ariaStatus, ")"));
        }
        this.cbSelectAll.setInputAriaLabel("".concat(ariaLabel, " (").concat(ariaStatus, ")"));
        this.headerCellCtrl.refreshAriaDescription();
    };
    SelectAllFeature.prototype.checkSelectionType = function (feature) {
        var isMultiSelect = this.gridOptionsService.get('rowSelection') === 'multiple';
        if (!isMultiSelect) {
            console.warn("AG Grid: ".concat(feature, " is only available if using 'multiple' rowSelection."));
            return false;
        }
        return true;
    };
    SelectAllFeature.prototype.checkRightRowModelType = function (feature) {
        var rowModelType = this.rowModel.getType();
        var rowModelMatches = rowModelType === 'clientSide' || rowModelType === 'serverSide';
        if (!rowModelMatches) {
            console.warn("AG Grid: ".concat(feature, " is only available if using 'clientSide' or 'serverSide' rowModelType, you are using ").concat(rowModelType, "."));
            return false;
        }
        return true;
    };
    SelectAllFeature.prototype.onCbSelectAll = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }
        var value = this.cbSelectAll.getValue();
        var justFiltered = this.isFilteredOnly();
        var justCurrentPage = this.isCurrentPageOnly();
        var source = 'uiSelectAll';
        if (justCurrentPage) {
            source = 'uiSelectAllCurrentPage';
        }
        else if (justFiltered) {
            source = 'uiSelectAllFiltered';
        }
        var params = {
            source: source,
            justFiltered: justFiltered,
            justCurrentPage: justCurrentPage,
        };
        if (value) {
            this.selectionService.selectAllRowNodes(params);
        }
        else {
            this.selectionService.deselectAllRowNodes(params);
        }
    };
    SelectAllFeature.prototype.isCheckboxSelection = function () {
        var result = this.column.getColDef().headerCheckboxSelection;
        if (typeof result === 'function') {
            var func = result;
            var params = {
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
    };
    SelectAllFeature.prototype.isFilteredOnly = function () {
        return !!this.column.getColDef().headerCheckboxSelectionFilteredOnly;
    };
    SelectAllFeature.prototype.isCurrentPageOnly = function () {
        return !!this.column.getColDef().headerCheckboxSelectionCurrentPageOnly;
    };
    __decorate([
        (0, context_1.Autowired)('rowModel')
    ], SelectAllFeature.prototype, "rowModel", void 0);
    __decorate([
        (0, context_1.Autowired)('selectionService')
    ], SelectAllFeature.prototype, "selectionService", void 0);
    return SelectAllFeature;
}(beanStub_1.BeanStub));
exports.SelectAllFeature = SelectAllFeature;
