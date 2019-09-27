// ag-grid-enterprise v21.2.2
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
var main_1 = require("ag-grid-community/main");
var pivotModePanel_1 = require("./panels/pivotModePanel");
var rowGroupDropZonePanel_1 = require("./panels/rowGroupDropZonePanel");
var valueDropZonePanel_1 = require("./panels/valueDropZonePanel");
var pivotDropZonePanel_1 = require("./panels/pivotDropZonePanel");
var primaryColsPanel_1 = require("./panels/primaryColsPanel/primaryColsPanel");
var ColumnToolPanel = /** @class */ (function (_super) {
    __extends(ColumnToolPanel, _super);
    function ColumnToolPanel() {
        var _this = _super.call(this, ColumnToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        return _this;
    }
    // lazy initialise the panel
    ColumnToolPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    ColumnToolPanel.prototype.init = function (params) {
        var defaultParams = {
            suppressSideButtons: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            api: this.gridApi
        };
        main_1._.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressPivotMode) {
            this.addComponent(new pivotModePanel_1.PivotModePanel());
        }
        this.addComponent(new primaryColsPanel_1.PrimaryColsPanel(true, this.params));
        if (!this.params.suppressRowGroups) {
            this.addComponent(new rowGroupDropZonePanel_1.RowGroupDropZonePanel(false));
        }
        if (!this.params.suppressValues) {
            this.addComponent(new valueDropZonePanel_1.ValuesDropZonePanel(false));
        }
        if (!this.params.suppressPivots) {
            this.addComponent(new pivotDropZonePanel_1.PivotDropZonePanel(false));
        }
        this.initialised = true;
    };
    ColumnToolPanel.prototype.addComponent = function (component) {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    };
    ColumnToolPanel.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        main_1._.clearElement(this.getGui());
    };
    ColumnToolPanel.prototype.refresh = function () {
        this.destroyChildren();
        this.init(this.params);
    };
    ColumnToolPanel.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ColumnToolPanel.TEMPLATE = "<div class=\"ag-column-panel\"></div>";
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ColumnToolPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired("gridApi"),
        __metadata("design:type", main_1.GridApi)
    ], ColumnToolPanel.prototype, "gridApi", void 0);
    __decorate([
        main_1.Autowired("eventService"),
        __metadata("design:type", main_1.EventService)
    ], ColumnToolPanel.prototype, "eventService", void 0);
    return ColumnToolPanel;
}(main_1.Component));
exports.ColumnToolPanel = ColumnToolPanel;
