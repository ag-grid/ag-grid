// ag-grid-enterprise v17.0.0
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
var ColumnPanel = (function (_super) {
    __extends(ColumnPanel, _super);
    function ColumnPanel() {
        var _this = _super.call(this, ColumnPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        _this.componentToResize = _this;
        return _this;
    }
    // lazy initialise the panel
    ColumnPanel.prototype.setVisible = function (visible) {
        _super.prototype.setVisible.call(this, visible);
        if (visible && !this.initialised) {
            this.init();
        }
    };
    ColumnPanel.prototype.init = function () {
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
    ColumnPanel.prototype.addComponent = function (component) {
        this.context.wireBean(component);
        this.eCenterPanel.appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    };
    ColumnPanel.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        main_1._.removeAllChildren(this.eCenterPanel);
    };
    ColumnPanel.prototype.refresh = function () {
        this.destroyChildren();
        this.init();
    };
    ColumnPanel.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ColumnPanel.TEMPLATE = "<div class=\"ag-column-panel\">\n            <ag-horizontal-resize class=\"ag-tool-panel-horizontal-resize\" [component-to-resize]=\"componentToResize\"></ag-horizontal-resize>\n            <div class=\"ag-column-panel-center\" ref=\"eColumnPanelCenter\"></div>\n        </div>";
    __decorate([
        main_1.Autowired("context"),
        __metadata("design:type", main_1.Context)
    ], ColumnPanel.prototype, "context", void 0);
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ColumnPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired("gridApi"),
        __metadata("design:type", main_1.GridApi)
    ], ColumnPanel.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_1.RefSelector('eColumnPanelCenter'),
        __metadata("design:type", HTMLElement)
    ], ColumnPanel.prototype, "eCenterPanel", void 0);
    return ColumnPanel;
}(main_1.Component));
exports.ColumnPanel = ColumnPanel;
