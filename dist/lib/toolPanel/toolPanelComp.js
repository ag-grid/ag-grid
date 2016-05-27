// ag-grid-enterprise v4.2.5
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
var columnSelectPanel_1 = require("./columnsSelect/columnSelectPanel");
var rowGroupColumnsPanel_1 = require("./columnDrop/rowGroupColumnsPanel");
var pivotColumnsPanel_1 = require("./columnDrop/pivotColumnsPanel");
var ToolPanelComp = (function (_super) {
    __extends(ToolPanelComp, _super);
    function ToolPanelComp() {
        _super.call(this, ToolPanelComp.TEMPLATE);
    }
    ToolPanelComp.prototype.init = function () {
        this.columnSelectPanel = new columnSelectPanel_1.ColumnSelectPanel(true);
        this.context.wireBean(this.columnSelectPanel);
        this.addInWrapper(this.columnSelectPanel.getGui(), '100%');
        var p2 = new rowGroupColumnsPanel_1.RowGroupColumnsPanel(false);
        var p4 = new pivotColumnsPanel_1.PivotColumnsPanel(false);
        this.context.wireBean(p2);
        this.context.wireBean(p4);
        // this.addInWrapper(p2.getGui(), '15%');
        // this.addInWrapper(p4.getGui(), '15%');
    };
    ToolPanelComp.prototype.addInWrapper = function (eElement, height) {
        var eDiv = document.createElement('div');
        eDiv.style.height = height;
        eDiv.appendChild(eElement);
        this.getGui().appendChild(eDiv);
    };
    ToolPanelComp.TEMPLATE = '<div class="ag-tool-panel"></div>';
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], ToolPanelComp.prototype, "context", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ToolPanelComp.prototype, "init", null);
    ToolPanelComp = __decorate([
        main_1.Bean('toolPanel'), 
        __metadata('design:paramtypes', [])
    ], ToolPanelComp);
    return ToolPanelComp;
})(main_1.Component);
exports.ToolPanelComp = ToolPanelComp;
