// ag-grid-enterprise v18.0.1
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
var main_1 = require("ag-grid/main");
var pivotModePanel_1 = require("./columnDrop/pivotModePanel");
var valueColumnsPanel_1 = require("./columnDrop/valueColumnsPanel");
var rowGroupColumnsPanel_1 = require("./columnDrop/rowGroupColumnsPanel");
var columnSelectComp_1 = require("./columnsSelect/columnSelectComp");
var pivotColumnsPanel_1 = require("./columnDrop/pivotColumnsPanel");
var ag_grid_1 = require("ag-grid");
var ToolPanelColumnComp = (function (_super) {
    __extends(ToolPanelColumnComp, _super);
    function ToolPanelColumnComp() {
        var _this = _super.call(this, ToolPanelColumnComp.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        // referenced in template
        _this.componentToResize = _this;
        return _this;
    }
    // lazy initialise the panel
    ToolPanelColumnComp.prototype.setVisible = function (visible) {
        _super.prototype.setVisible.call(this, visible);
        if (visible && !this.initialised) {
            this.init();
        }
        var event = {
            type: main_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    };
    ToolPanelColumnComp.prototype.init = function () {
        this.instantiate(this.context);
        if (!this.gridOptionsWrapper.isToolPanelSuppressPivotMode()) {
            this.addComponent(new pivotModePanel_1.PivotModePanel());
        }
        this.addComponent(new columnSelectComp_1.ColumnSelectComp(true));
        if (!this.gridOptionsWrapper.isToolPanelSuppressRowGroups()) {
            this.addComponent(new rowGroupColumnsPanel_1.RowGroupColumnsPanel(false));
        }
        if (!this.gridOptionsWrapper.isToolPanelSuppressValues()) {
            this.addComponent(new valueColumnsPanel_1.ValuesColumnPanel(false));
        }
        if (!this.gridOptionsWrapper.isToolPanelSuppressPivots()) {
            this.addComponent(new pivotColumnsPanel_1.PivotColumnsPanel(false));
        }
        this.initialised = true;
    };
    ToolPanelColumnComp.prototype.addComponent = function (component) {
        this.context.wireBean(component);
        this.eCenterPanel.appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    };
    ToolPanelColumnComp.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        main_1._.removeAllChildren(this.eCenterPanel);
    };
    ToolPanelColumnComp.prototype.refresh = function () {
        this.destroyChildren();
        this.init();
    };
    ToolPanelColumnComp.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ToolPanelColumnComp.TEMPLATE = "<div class=\"ag-column-panel\">\n            <ag-horizontal-resize class=\"ag-tool-panel-horizontal-resize\" [component-to-resize]=\"componentToResize\"></ag-horizontal-resize>\n            <div class=\"ag-column-panel-center\" ref=\"eColumnPanelCenter\"></div>\n        </div>";
    __decorate([
        main_1.Autowired("context"),
        __metadata("design:type", main_1.Context)
    ], ToolPanelColumnComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelColumnComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired("gridApi"),
        __metadata("design:type", main_1.GridApi)
    ], ToolPanelColumnComp.prototype, "gridApi", void 0);
    __decorate([
        main_1.Autowired("eventService"),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelColumnComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.RefSelector('eColumnPanelCenter'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnComp.prototype, "eCenterPanel", void 0);
    return ToolPanelColumnComp;
}(main_1.Component));
exports.ToolPanelColumnComp = ToolPanelColumnComp;
