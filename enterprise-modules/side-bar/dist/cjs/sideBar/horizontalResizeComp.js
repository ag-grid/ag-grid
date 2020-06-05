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
var HorizontalResizeComp = /** @class */ (function (_super) {
    __extends(HorizontalResizeComp, _super);
    function HorizontalResizeComp() {
        return _super.call(this, /* html */ "<div class=\"ag-tool-panel-horizontal-resize\"></div>") || this;
    }
    HorizontalResizeComp.prototype.setElementToResize = function (elementToResize) {
        this.elementToResize = elementToResize;
    };
    HorizontalResizeComp.prototype.postConstruct = function () {
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizing.bind(this)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsWrapper.isEnableRtl());
    };
    HorizontalResizeComp.prototype.onResizeStart = function () {
        this.startingWidth = this.elementToResize.offsetWidth;
    };
    HorizontalResizeComp.prototype.onResizing = function (delta) {
        var direction = this.inverted ? -1 : 1;
        var newWidth = Math.max(100, Math.floor(this.startingWidth - (delta * direction)));
        this.elementToResize.style.width = newWidth + "px";
    };
    HorizontalResizeComp.prototype.setInverted = function (inverted) {
        this.inverted = inverted;
    };
    __decorate([
        core_1.Autowired('horizontalResizeService')
    ], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], HorizontalResizeComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.PostConstruct
    ], HorizontalResizeComp.prototype, "postConstruct", null);
    return HorizontalResizeComp;
}(core_1.Component));
exports.HorizontalResizeComp = HorizontalResizeComp;
//# sourceMappingURL=horizontalResizeComp.js.map