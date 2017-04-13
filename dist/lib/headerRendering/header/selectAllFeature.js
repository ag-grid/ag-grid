/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var agCheckbox_1 = require("../../widgets/agCheckbox");
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var columnController_1 = require("../../columnController/columnController");
var gridApi_1 = require("../../gridApi");
var events_1 = require("../../events");
var eventService_1 = require("../../eventService");
var constants_1 = require("../../constants");
var selectionController_1 = require("../../selectionController");
var SelectAllFeature = (function (_super) {
    __extends(SelectAllFeature, _super);
    function SelectAllFeature(cbSelectAll, column) {
        var _this = _super.call(this) || this;
        _this.cbSelectAllVisible = false;
        _this.processingEventFromCheckbox = false;
        _this.cbSelectAll = cbSelectAll;
        _this.column = column;
        var colDef = column.getColDef();
        _this.filteredOnly = colDef ? !!colDef.headerCheckboxSelectionFilteredOnly : false;
        return _this;
    }
    SelectAllFeature.prototype.postConstruct = function () {
        this.showOrHideSelectAll();
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelectAll.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addDestroyableEventListener(this.cbSelectAll, agCheckbox_1.AgCheckbox.EVENT_CHANGED, this.onCbSelectAll.bind(this));
    };
    SelectAllFeature.prototype.showOrHideSelectAll = function () {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setVisible(this.cbSelectAllVisible);
        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType();
            // make sure checkbox is showing the right state
            this.updateStateOfCheckbox();
        }
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
    SelectAllFeature.prototype.getNextCheckboxState = function (selectionCount) {
        if (selectionCount.selected === 0 && selectionCount.notSelected === 0) {
            // if no rows, always have it unselected
            return false;
        }
        else if (selectionCount.selected > 0 && selectionCount.notSelected > 0) {
            // if mix of selected and unselected, this is the tri-state
            return null;
        }
        else if (selectionCount.selected > 0) {
            // only selected
            return true;
        }
        else {
            // nothing selected
            return false;
        }
    };
    SelectAllFeature.prototype.updateStateOfCheckbox = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        this.processingEventFromCheckbox = true;
        var selectionCount = this.getSelectionCount();
        var allSelected = this.getNextCheckboxState(selectionCount);
        this.cbSelectAll.setSelected(allSelected);
        this.processingEventFromCheckbox = false;
    };
    SelectAllFeature.prototype.getSelectionCount = function () {
        var selectedCount = 0;
        var notSelectedCount = 0;
        var callback = function (node) {
            if (node.isSelected()) {
                selectedCount++;
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
    };
    SelectAllFeature.prototype.checkRightRowModelType = function () {
        var rowModelType = this.rowModel.getType();
        var rowModelMatches = rowModelType === constants_1.Constants.ROW_MODEL_TYPE_NORMAL || constants_1.Constants.ROW_MODEL_TYPE_PAGINATION;
        if (!rowModelMatches) {
            console.log("ag-Grid: selectAllCheckbox is only available if using normal or pagination row models, you are using " + rowModelType);
        }
    };
    SelectAllFeature.prototype.onCbSelectAll = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }
        var value = this.cbSelectAll.isSelected();
        if (value) {
            this.selectionController.selectAllRowNodes(this.filteredOnly);
        }
        else {
            this.selectionController.deselectAllRowNodes(this.filteredOnly);
        }
    };
    SelectAllFeature.prototype.isCheckboxSelection = function () {
        var headerCheckboxSelection = this.column.getColDef().headerCheckboxSelection;
        if (headerCheckboxSelection === true) {
            return true;
        }
        if (typeof headerCheckboxSelection === 'function') {
            var func = headerCheckboxSelection;
            return func({
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.columnApi,
                api: this.gridApi
            });
        }
        return false;
    };
    return SelectAllFeature;
}(beanStub_1.BeanStub));
__decorate([
    context_1.Autowired('gridApi'),
    __metadata("design:type", gridApi_1.GridApi)
], SelectAllFeature.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi'),
    __metadata("design:type", columnController_1.ColumnApi)
], SelectAllFeature.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], SelectAllFeature.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('rowModel'),
    __metadata("design:type", Object)
], SelectAllFeature.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('selectionController'),
    __metadata("design:type", selectionController_1.SelectionController)
], SelectAllFeature.prototype, "selectionController", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SelectAllFeature.prototype, "postConstruct", null);
exports.SelectAllFeature = SelectAllFeature;
