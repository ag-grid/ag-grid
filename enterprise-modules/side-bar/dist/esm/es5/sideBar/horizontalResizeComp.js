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
import { Autowired, Component, PostConstruct, Events } from "@ag-grid-community/core";
var HorizontalResizeComp = /** @class */ (function (_super) {
    __extends(HorizontalResizeComp, _super);
    function HorizontalResizeComp() {
        var _this = _super.call(this, /* html */ "<div class=\"ag-tool-panel-horizontal-resize\"></div>") || this;
        _this.minWidth = 100;
        _this.maxWidth = null;
        return _this;
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
            onResizeEnd: this.onResizeEnd.bind(this)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsWrapper.isEnableRtl());
    };
    HorizontalResizeComp.prototype.dispatchResizeEvent = function (start, end, width) {
        var event = {
            type: Events.EVENT_TOOL_PANEL_SIZE_CHANGED,
            width: width,
            started: start,
            ended: end,
        };
        this.eventService.dispatchEvent(event);
    };
    HorizontalResizeComp.prototype.onResizeStart = function () {
        this.startingWidth = this.elementToResize.offsetWidth;
        this.dispatchResizeEvent(true, false, this.startingWidth);
    };
    HorizontalResizeComp.prototype.onResizeEnd = function (delta) {
        return this.onResizing(delta, true);
    };
    HorizontalResizeComp.prototype.onResizing = function (delta, isEnd) {
        if (isEnd === void 0) { isEnd = false; }
        var direction = this.inverted ? -1 : 1;
        var newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - (delta * direction)));
        if (this.maxWidth != null) {
            newWidth = Math.min(this.maxWidth, newWidth);
        }
        this.elementToResize.style.width = newWidth + "px";
        this.dispatchResizeEvent(false, isEnd, newWidth);
    };
    HorizontalResizeComp.prototype.setInverted = function (inverted) {
        this.inverted = inverted;
    };
    HorizontalResizeComp.prototype.setMaxWidth = function (value) {
        this.maxWidth = value;
    };
    HorizontalResizeComp.prototype.setMinWidth = function (value) {
        if (value != null) {
            this.minWidth = value;
        }
        else {
            this.minWidth = 100;
        }
    };
    __decorate([
        Autowired('horizontalResizeService')
    ], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        PostConstruct
    ], HorizontalResizeComp.prototype, "postConstruct", null);
    return HorizontalResizeComp;
}(Component));
export { HorizontalResizeComp };
