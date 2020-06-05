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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var horizontalResizeComp_1 = require("./horizontalResizeComp");
var ToolPanelWrapper = /** @class */ (function (_super) {
    __extends(ToolPanelWrapper, _super);
    function ToolPanelWrapper() {
        return _super.call(this, ToolPanelWrapper.TEMPLATE) || this;
    }
    ToolPanelWrapper.prototype.getToolPanelId = function () {
        return this.toolPanelId;
    };
    ToolPanelWrapper.prototype.setToolPanelDef = function (toolPanelDef) {
        this.toolPanelId = toolPanelDef.id;
        var params = {
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        var componentPromise = this.userComponentFactory.newToolPanelComponent(toolPanelDef, params);
        if (componentPromise == null) {
            console.warn("ag-grid: error processing tool panel component " + toolPanelDef.id + ". You need to specify either 'toolPanel' or 'toolPanelFramework'");
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
    };
    ToolPanelWrapper.prototype.setupResize = function () {
        var resizeBar = this.resizeBar = new horizontalResizeComp_1.HorizontalResizeComp();
        this.getContext().createBean(resizeBar);
        resizeBar.setElementToResize(this.getGui());
        this.appendChild(resizeBar);
    };
    ToolPanelWrapper.prototype.setToolPanelComponent = function (compInstance) {
        var _this = this;
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(function () {
            _this.destroyBean(compInstance);
        });
    };
    ToolPanelWrapper.prototype.getToolPanelInstance = function () {
        return this.toolPanelCompInstance;
    };
    ToolPanelWrapper.prototype.setResizerSizerSide = function (side) {
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        var isLeft = side === 'left';
        var inverted = isRtl ? isLeft : !isLeft;
        this.resizeBar.setInverted(inverted);
    };
    ToolPanelWrapper.prototype.refresh = function () {
        this.toolPanelCompInstance.refresh();
    };
    ToolPanelWrapper.TEMPLATE = "<div class=\"ag-tool-panel-wrapper\"/>";
    __decorate([
        core_1.Autowired("userComponentFactory")
    ], ToolPanelWrapper.prototype, "userComponentFactory", void 0);
    __decorate([
        core_1.Autowired("gridOptionsWrapper")
    ], ToolPanelWrapper.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelWrapper.prototype, "setupResize", null);
    return ToolPanelWrapper;
}(core_1.Component));
exports.ToolPanelWrapper = ToolPanelWrapper;
//# sourceMappingURL=toolPanelWrapper.js.map