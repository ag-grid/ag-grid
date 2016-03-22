// ag-grid-enterprise v4.0.7
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var columnSelectPanel_1 = require("./columnSelect/columnSelectPanel");
var ToolPanel = (function (_super) {
    __extends(ToolPanel, _super);
    function ToolPanel() {
        _super.call(this, ToolPanel.TEMPLATE);
    }
    ToolPanel.prototype.agWire = function () {
        this.columnSelectPanel = new columnSelectPanel_1.ColumnSelectPanel(true);
    };
    ToolPanel.prototype.init = function () {
        this.context.wireBean(this.columnSelectPanel);
        this.getGui().appendChild(this.columnSelectPanel.getGui());
    };
    ToolPanel.TEMPLATE = '<div class="ag-tool-panel"></div>';
    __decorate([
        main_3.Autowired('context'), 
        __metadata('design:type', main_4.Context)
    ], ToolPanel.prototype, "context", void 0);
    __decorate([
        main_5.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ToolPanel.prototype, "init", null);
    ToolPanel = __decorate([
        main_1.Bean('toolPanel'), 
        __metadata('design:paramtypes', [])
    ], ToolPanel);
    return ToolPanel;
})(main_2.Component);
exports.ToolPanel = ToolPanel;
