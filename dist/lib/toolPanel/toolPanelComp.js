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
var columnPanel_1 = require("./columnPanel");
var ToolPanelComp = (function (_super) {
    __extends(ToolPanelComp, _super);
    function ToolPanelComp() {
        var _this = _super.call(this, "<div class=\"ag-tool-panel\"/>") || this;
        // solves a race condition, where this is getting initialised after the grid core.
        // so gridCore also calls init()
        _this.initialised = false;
        return _this;
    }
    ToolPanelComp.prototype.postConstruct = function () {
        this.init();
    };
    ToolPanelComp.prototype.init = function () {
        if (this.initialised) {
            return;
        }
        this.initialised = true;
        this.columnPanel = new columnPanel_1.ColumnPanel();
        this.buttonComp = new PanelSelectComp(this.columnPanel);
        this.context.wireBean(this.columnPanel);
        this.context.wireBean(this.buttonComp);
        this.appendChild(this.buttonComp);
        this.appendChild(this.columnPanel);
    };
    ToolPanelComp.prototype.refresh = function () {
        this.columnPanel.refresh();
    };
    ToolPanelComp.prototype.showToolPanel = function (show) {
        this.columnPanel.setVisible(show);
        var event = {
            type: main_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    };
    ToolPanelComp.prototype.isToolPanelShowing = function () {
        return this.columnPanel.isVisible();
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
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelComp.prototype, "postConstruct", null);
    ToolPanelComp = __decorate([
        main_1.Bean("toolPanelComp"),
        __metadata("design:paramtypes", [])
    ], ToolPanelComp);
    return ToolPanelComp;
}(main_1.Component));
exports.ToolPanelComp = ToolPanelComp;
var PanelSelectComp = (function (_super) {
    __extends(PanelSelectComp, _super);
    function PanelSelectComp(columnPanel) {
        var _this = _super.call(this) || this;
        _this.columnPanel = columnPanel;
        return _this;
    }
    PanelSelectComp.prototype.createTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div class=\"ag-side-buttons\">\n                    <button type=\"button\" ref=\"toggle-button\">" + translate('columns', 'Columns') + "</button>\n                </div>";
    };
    PanelSelectComp.prototype.postConstruct = function () {
        var _this = this;
        this.setTemplate(this.createTemplate());
        var btShow = this.getRefElement("toggle-button");
        this.addDestroyableEventListener(btShow, 'click', function () {
            _this.columnPanel.setVisible(!_this.columnPanel.isVisible());
            // this gets grid to resize immediately, rather than waiting
            // for next 500ms
            _this.gridCore.doLayout();
        });
        var showButtons = !this.gridOptionsWrapper.isToolPanelSuppressSideButtons();
        this.setVisible(showButtons);
    };
    __decorate([
        main_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PanelSelectComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired("gridCore"),
        __metadata("design:type", main_1.GridCore)
    ], PanelSelectComp.prototype, "gridCore", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PanelSelectComp.prototype, "postConstruct", null);
    return PanelSelectComp;
}(main_1.Component));
