/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var rowNode_1 = require("../entities/rowNode");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var gridApi_1 = require("../gridApi");
var columnApi_1 = require("../columnController/columnApi");
var utils_1 = require("../utils");
var CheckboxSelectionComponent = /** @class */ (function (_super) {
    __extends(CheckboxSelectionComponent, _super);
    function CheckboxSelectionComponent() {
        return _super.call(this, "<span class=\"ag-selection-checkbox\" unselectable=\"on\"/>") || this;
    }
    CheckboxSelectionComponent.prototype.createAndAddIcons = function () {
        this.eCheckedIcon = utils_1._.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = utils_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eIndeterminateIcon = utils_1._.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.column);
        var element = this.getGui();
        element.appendChild(this.eCheckedIcon);
        element.appendChild(this.eUncheckedIcon);
        element.appendChild(this.eIndeterminateIcon);
    };
    CheckboxSelectionComponent.prototype.onDataChanged = function () {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    };
    CheckboxSelectionComponent.prototype.onSelectableChanged = function () {
        this.showOrHideSelect();
    };
    CheckboxSelectionComponent.prototype.onSelectionChanged = function () {
        var state = this.rowNode.isSelected();
        utils_1._.setDisplayed(this.eCheckedIcon, state === true);
        utils_1._.setDisplayed(this.eUncheckedIcon, state === false);
        utils_1._.setDisplayed(this.eIndeterminateIcon, typeof state !== 'boolean');
    };
    CheckboxSelectionComponent.prototype.onCheckedClicked = function () {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({ newValue: false, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    };
    CheckboxSelectionComponent.prototype.onUncheckedClicked = function (event) {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({ newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    };
    CheckboxSelectionComponent.prototype.onIndeterminateClicked = function (event) {
        var result = this.onUncheckedClicked(event);
        if (result === 0) {
            this.onCheckedClicked();
        }
    };
    CheckboxSelectionComponent.prototype.init = function (params) {
        this.rowNode = params.rowNode;
        this.column = params.column;
        this.createAndAddIcons();
        this.onSelectionChanged();
        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', function (event) { return utils_1._.stopPropagationForAgGrid(event); });
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', function (event) { return utils_1._.stopPropagationForAgGrid(event); });
        this.addDestroyableEventListener(this.eCheckedIcon, 'click', this.onCheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eUncheckedIcon, 'click', this.onUncheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eIndeterminateIcon, 'click', this.onIndeterminateClicked.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));
        this.isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        var checkboxVisibleIsDynamic = this.isRowSelectableFunc || this.checkboxCallbackExists();
        if (checkboxVisibleIsDynamic) {
            this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelect.bind(this));
            this.showOrHideSelect();
        }
    };
    CheckboxSelectionComponent.prototype.showOrHideSelect = function () {
        // if the isRowSelectable() is not provided the row node is selectable by default
        var selectable = this.rowNode.selectable;
        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        if (selectable && this.checkboxCallbackExists()) {
            selectable = this.column.isCellCheckboxSelection(this.rowNode);
        }
        // show checkbox if both conditions are true
        this.setDisplayed(selectable);
    };
    CheckboxSelectionComponent.prototype.checkboxCallbackExists = function () {
        // column will be missing if groupUseEntireRow=true
        var colDef = this.column ? this.column.getColDef() : null;
        return colDef && typeof colDef.checkboxSelection === 'function';
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], CheckboxSelectionComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], CheckboxSelectionComponent.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], CheckboxSelectionComponent.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], CheckboxSelectionComponent.prototype, "columnApi", void 0);
    return CheckboxSelectionComponent;
}(component_1.Component));
exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
