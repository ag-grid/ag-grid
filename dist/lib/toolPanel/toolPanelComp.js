// ag-grid-enterprise v16.0.1
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
var columnSelectComp_1 = require("./columnsSelect/columnSelectComp");
var rowGroupColumnsPanel_1 = require("./columnDrop/rowGroupColumnsPanel");
var pivotColumnsPanel_1 = require("./columnDrop/pivotColumnsPanel");
var pivotModePanel_1 = require("./columnDrop/pivotModePanel");
var valueColumnsPanel_1 = require("./columnDrop/valueColumnsPanel");
var ag_grid_1 = require("ag-grid");
var ToolPanelComp = (function (_super) {
    __extends(ToolPanelComp, _super);
    function ToolPanelComp() {
        var _this = _super.call(this, ToolPanelComp_1.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        return _this;
    }
    ToolPanelComp_1 = ToolPanelComp;
    // lazy initialise the toolPanel
    ToolPanelComp.prototype.setVisible = function (visible) {
        _super.prototype.setVisible.call(this, visible);
        if (visible && !this.initialised) {
            this.init();
        }
    };
    ToolPanelComp.prototype.init = function () {
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
    ToolPanelComp.prototype.addComponent = function (component) {
        this.context.wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    };
    ToolPanelComp.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        ag_grid_1._.removeAllChildren(this.getGui());
    };
    ToolPanelComp.prototype.refresh = function () {
        this.destroyChildren();
        this.init();
    };
    ToolPanelComp.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ToolPanelComp.TEMPLATE = '<div class="ag-tool-panel"></div>';
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], ToolPanelComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelComp.prototype, "gridOptionsWrapper", void 0);
    ToolPanelComp = ToolPanelComp_1 = __decorate([
        main_1.Bean('toolPanel'),
        __metadata("design:paramtypes", [])
    ], ToolPanelComp);
    return ToolPanelComp;
    var ToolPanelComp_1;
}(main_1.Component));
exports.ToolPanelComp = ToolPanelComp;
