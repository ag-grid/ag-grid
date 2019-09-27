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
var ag_grid_community_1 = require("ag-grid-community");
var HorizontalResizeComp = /** @class */ (function (_super) {
    __extends(HorizontalResizeComp, _super);
    function HorizontalResizeComp() {
        return _super.call(this, "<div class=\"ag-tool-panel-horizontal-resize\"></div>") || this;
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
    };
    HorizontalResizeComp.prototype.onResizeStart = function () {
        this.startingWidth = this.elementToResize.offsetWidth;
    };
    HorizontalResizeComp.prototype.onResizing = function (delta) {
        var direction = this.gridOptionsWrapper.isEnableRtl() ? -1 : 1;
        var newWidth = Math.max(100, Math.floor(this.startingWidth - (delta * direction)));
        this.elementToResize.style.width = newWidth + "px";
    };
    __decorate([
        ag_grid_community_1.Autowired('horizontalResizeService'),
        __metadata("design:type", ag_grid_community_1.HorizontalResizeService)
    ], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], HorizontalResizeComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], HorizontalResizeComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HorizontalResizeComp.prototype, "postConstruct", null);
    return HorizontalResizeComp;
}(ag_grid_community_1.Component));
exports.HorizontalResizeComp = HorizontalResizeComp;
