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
var component_1 = require("../widgets/component");
var rowNode_1 = require("../entities/rowNode");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var svgFactory_1 = require("../svgFactory");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var gridApi_1 = require("../gridApi");
var columnController_1 = require("../columnController/columnController");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var CheckboxSelectionComponent = (function (_super) {
    __extends(CheckboxSelectionComponent, _super);
    function CheckboxSelectionComponent() {
        return _super.call(this, "<span class=\"ag-selection-checkbox\"/>") || this;
    }
    CheckboxSelectionComponent.prototype.createAndAddIcons = function () {
        this.eCheckedIcon = utils_1.Utils.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon);
        this.eUncheckedIcon = utils_1.Utils.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon);
        this.eIndeterminateIcon = utils_1.Utils.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateIcon);
        var eGui = this.getGui();
        eGui.appendChild(this.eCheckedIcon);
        eGui.appendChild(this.eUncheckedIcon);
        eGui.appendChild(this.eIndeterminateIcon);
    };
    CheckboxSelectionComponent.prototype.onSelectionChanged = function () {
        var state = this.rowNode.isSelected();
        utils_1.Utils.setVisible(this.eCheckedIcon, state === true);
        utils_1.Utils.setVisible(this.eUncheckedIcon, state === false);
        utils_1.Utils.setVisible(this.eIndeterminateIcon, typeof state !== 'boolean');
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
        this.createAndAddIcons();
        this.rowNode = params.rowNode;
        this.column = params.column;
        this.visibleFunc = params.visibleFunc;
        this.onSelectionChanged();
        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', function (event) { return event.stopPropagation(); });
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', function (event) { return event.stopPropagation(); });
        this.addDestroyableEventListener(this.eCheckedIcon, 'click', this.onCheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eUncheckedIcon, 'click', this.onUncheckedClicked.bind(this));
        this.addDestroyableEventListener(this.eIndeterminateIcon, 'click', this.onIndeterminateClicked.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        if (this.visibleFunc) {
            this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelect.bind(this));
            this.showOrHideSelect();
        }
    };
    CheckboxSelectionComponent.prototype.showOrHideSelect = function () {
        var params = this.createParams();
        var visible = this.visibleFunc(params);
        this.setVisible(visible);
    };
    CheckboxSelectionComponent.prototype.createParams = function () {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    };
    return CheckboxSelectionComponent;
}(component_1.Component));
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
    __metadata("design:type", columnController_1.ColumnApi)
], CheckboxSelectionComponent.prototype, "columnApi", void 0);
exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
