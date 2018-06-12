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
var toolPanelColumnComp_1 = require("./toolPanelColumnComp");
var toolPanelSelectComp_1 = require("./toolPanelSelectComp");
var ToolPanelComp = (function (_super) {
    __extends(ToolPanelComp, _super);
    function ToolPanelComp() {
        return _super.call(this, "<div class=\"ag-tool-panel\">\n                  <ag-tool-panel-select-comp ref=\"toolPanelSelectComp\"></ag-tool-panel-select-comp>\n                  <ag-tool-panel-column-comp ref=\"columnComp\"></ag-tool-panel-column-comp>\n              </div>") || this;
    }
    ToolPanelComp.prototype.getPreferredWidth = function () {
        return this.getGui().clientWidth;
    };
    ToolPanelComp.prototype.registerGridComp = function (gridPanel) {
        this.toolPanelSelectComp.registerGridComp(gridPanel);
    };
    ToolPanelComp.prototype.postConstruct = function () {
        this.instantiate(this.context);
        this.toolPanelSelectComp.registerColumnComp(this.columnComp);
    };
    ToolPanelComp.prototype.refresh = function () {
        this.columnComp.refresh();
    };
    ToolPanelComp.prototype.showToolPanel = function (show) {
        this.columnComp.setVisible(show);
    };
    ToolPanelComp.prototype.isToolPanelShowing = function () {
        return this.columnComp.isVisible();
    };
    __decorate([
        main_1.Autowired("context"),
        __metadata("design:type", main_1.Context)
    ], ToolPanelComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired("eventService"),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelComp.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.RefSelector('toolPanelSelectComp'),
        __metadata("design:type", toolPanelSelectComp_1.ToolPanelSelectComp)
    ], ToolPanelComp.prototype, "toolPanelSelectComp", void 0);
    __decorate([
        main_1.RefSelector('columnComp'),
        __metadata("design:type", toolPanelColumnComp_1.ToolPanelColumnComp)
    ], ToolPanelComp.prototype, "columnComp", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelComp.prototype, "postConstruct", null);
    return ToolPanelComp;
}(main_1.Component));
exports.ToolPanelComp = ToolPanelComp;
