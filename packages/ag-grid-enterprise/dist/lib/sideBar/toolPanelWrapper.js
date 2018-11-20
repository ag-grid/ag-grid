// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
var ag_grid_community_1 = require("ag-grid-community");
var horizontalResizeComp_1 = require("./horizontalResizeComp");
var ToolPanelWrapper = /** @class */ (function (_super) {
    __extends(ToolPanelWrapper, _super);
    function ToolPanelWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToolPanelWrapper.prototype.init = function (params) {
        this.params = params;
        this.componentToResize = params.innerComp;
        this.setTemplate(ToolPanelWrapper.TEMPLATE);
        var resizeBar = this.componentResolver.createInternalAgGridComponent(horizontalResizeComp_1.HorizontalResizeComp, {});
        resizeBar.props = {
            componentToResize: this
        };
        resizeBar.addCssClass('ag-tool-panel-horizontal-resize');
        this.getGui().appendChild(resizeBar.getGui());
        this.getGui().appendChild(params.innerComp.getGui());
    };
    ToolPanelWrapper.prototype.refresh = function () {
        this.params.innerComp.refresh();
    };
    ToolPanelWrapper.TEMPLATE = "<div class=\"ag-tool-panel-wrapper\"/>";
    __decorate([
        ag_grid_community_1.Autowired("componentResolver"),
        __metadata("design:type", ag_grid_community_1.ComponentResolver)
    ], ToolPanelWrapper.prototype, "componentResolver", void 0);
    return ToolPanelWrapper;
}(ag_grid_community_1.Component));
exports.ToolPanelWrapper = ToolPanelWrapper;
