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
var ToolPanelSelectComp = (function (_super) {
    __extends(ToolPanelSelectComp, _super);
    function ToolPanelSelectComp() {
        return _super.call(this, "<div class=\"ag-side-buttons\"></div>") || this;
    }
    ToolPanelSelectComp.prototype.registerColumnComp = function (columnPanel) {
        this.columnPanel = columnPanel;
    };
    ToolPanelSelectComp.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    ToolPanelSelectComp.prototype.postConstruct = function () {
        var _this = this;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.getGui().innerHTML = "<button type=\"button\" ref=\"toggle-button\">" + translate('columns', 'Columns') + "</button>";
        var btShow = this.getRefElement("toggle-button");
        this.addDestroyableEventListener(btShow, 'click', function () {
            _this.columnPanel.setVisible(!_this.columnPanel.isVisible());
        });
        var showButtons = !this.gridOptionsWrapper.isToolPanelSuppressSideButtons();
        this.setVisible(showButtons);
    };
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelSelectComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired("eventService"),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelSelectComp.prototype, "eventService", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelSelectComp.prototype, "postConstruct", null);
    return ToolPanelSelectComp;
}(main_1.Component));
exports.ToolPanelSelectComp = ToolPanelSelectComp;
