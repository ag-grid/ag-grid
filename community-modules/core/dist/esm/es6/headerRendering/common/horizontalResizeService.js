/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
let HorizontalResizeService = class HorizontalResizeService extends BeanStub {
    addResizeBar(params) {
        const dragSource = {
            dragStartPixels: params.dragStartPixels || 0,
            eElement: params.eResizeBar,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this, params),
            onDragging: this.onDragging.bind(this, params)
        };
        this.dragService.addDragSource(dragSource, true);
        // we pass remove func back to the caller, so call can tell us when they
        // are finished, and then we remove the listener from the drag source
        const finishedWithResizeFunc = () => this.dragService.removeDragSource(dragSource);
        return finishedWithResizeFunc;
    }
    onDragStart(params, mouseEvent) {
        this.dragStartX = mouseEvent.clientX;
        this.setResizeIcons();
        const shiftKey = mouseEvent instanceof MouseEvent && mouseEvent.shiftKey === true;
        params.onResizeStart(shiftKey);
    }
    setResizeIcons() {
        const ctrl = this.ctrlsService.getGridCtrl();
        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        ctrl.setResizeCursor(true);
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        ctrl.disableUserSelect(true);
    }
    onDragStop(params, mouseEvent) {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    }
    resetIcons() {
        const ctrl = this.ctrlsService.getGridCtrl();
        ctrl.setResizeCursor(false);
        ctrl.disableUserSelect(false);
    }
    onDragging(params, mouseEvent) {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    }
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
export { HorizontalResizeService };
