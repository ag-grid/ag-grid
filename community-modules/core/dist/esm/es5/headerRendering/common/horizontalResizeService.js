/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired, Bean } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
var HorizontalResizeService = /** @class */ (function (_super) {
    __extends(HorizontalResizeService, _super);
    function HorizontalResizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        this.dragStartX = mouseEvent.clientX;
        this.setResizeIcons();
        var shiftKey = mouseEvent instanceof MouseEvent && mouseEvent.shiftKey === true;
        params.onResizeStart(shiftKey);
    };
    HorizontalResizeService.prototype.setResizeIcons = function () {
        var ctrl = this.ctrlsService.getGridCtrl();
        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        ctrl.setResizeCursor(true);
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        ctrl.disableUserSelect(true);
    };
    HorizontalResizeService.prototype.onDragStop = function (params, mouseEvent) {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    };
    HorizontalResizeService.prototype.resetIcons = function () {
        var ctrl = this.ctrlsService.getGridCtrl();
        ctrl.setResizeCursor(false);
        ctrl.disableUserSelect(false);
    };
    HorizontalResizeService.prototype.onDragging = function (params, mouseEvent) {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    };
    __decorate([
        Autowired('dragService')
    ], HorizontalResizeService.prototype, "dragService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], HorizontalResizeService.prototype, "ctrlsService", void 0);
    HorizontalResizeService = __decorate([
        Bean('horizontalResizeService')
    ], HorizontalResizeService);
    return HorizontalResizeService;
}(BeanStub));
export { HorizontalResizeService };
