/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var dragService_1 = require("../dragAndDrop/dragService");
var HorizontalResizeService = /** @class */ (function () {
    function HorizontalResizeService() {
    }
    HorizontalResizeService.prototype.addResizeBar = function (params) {
        var _this = this;
        var dragSource = {
            dragStartPixels: params.dragStartPixels || 0,
            eElement: params.eResizeBar,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this, params),
            onDragging: this.onDragging.bind(this, params)
        };
        this.dragService.addDragSource(dragSource, true);
        // we pass remove func back to the caller, so call can tell us when they
        // are finished, and then we remove the listener from the drag source
        var finishedWithResizeFunc = function () { return _this.dragService.removeDragSource(dragSource); };
        return finishedWithResizeFunc;
    };
    HorizontalResizeService.prototype.onDragStart = function (params, mouseEvent) {
        this.draggingStarted = true;
        this.dragStartX = mouseEvent.clientX;
        this.setResizeIcons();
        var shiftKey = mouseEvent instanceof MouseEvent ? mouseEvent.shiftKey === true : false;
        params.onResizeStart(shiftKey);
    };
    HorizontalResizeService.prototype.setResizeIcons = function () {
        this.oldBodyCursor = this.eGridDiv.style.cursor;
        this.oldMsUserSelect = this.eGridDiv.style.msUserSelect;
        this.oldWebkitUserSelect = this.eGridDiv.style.webkitUserSelect;
        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        this.eGridDiv.style.cursor = 'col-resize';
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        this.eGridDiv.style.msUserSelect = 'none';
        this.eGridDiv.style.webkitUserSelect = 'none';
    };
    HorizontalResizeService.prototype.onDragStop = function (params, mouseEvent) {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    };
    HorizontalResizeService.prototype.resetIcons = function () {
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        this.eGridDiv.style.cursor = this.oldBodyCursor;
        this.eGridDiv.style.msUserSelect = this.oldMsUserSelect;
        this.eGridDiv.style.webkitUserSelect = this.oldWebkitUserSelect;
    };
    HorizontalResizeService.prototype.onDragging = function (params, mouseEvent) {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HorizontalResizeService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('dragService'),
        __metadata("design:type", dragService_1.DragService)
    ], HorizontalResizeService.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('eGridDiv'),
        __metadata("design:type", HTMLElement)
    ], HorizontalResizeService.prototype, "eGridDiv", void 0);
    HorizontalResizeService = __decorate([
        context_1.Bean('horizontalResizeService')
    ], HorizontalResizeService);
    return HorizontalResizeService;
}());
exports.HorizontalResizeService = HorizontalResizeService;
