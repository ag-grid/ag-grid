/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../../context/beanStub";
import { Autowired, PostConstruct } from "../../../context/context";
import { setDisplayed } from "../../../utils/dom";
import { TouchListener } from "../../../widgets/touchListener";
export class ResizeFeature extends BeanStub {
    constructor(pinned, column, eResize, comp, ctrl) {
        super();
        this.pinned = pinned;
        this.column = column;
        this.eResize = eResize;
        this.comp = comp;
        this.ctrl = ctrl;
    }
    postConstruct() {
        const colDef = this.column.getColDef();
        const destroyResizeFuncs = [];
        let canResize;
        let canAutosize;
        const addResize = () => {
            setDisplayed(this.eResize, canResize);
            if (!canResize) {
                return;
            }
            const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
                eResizeBar: this.eResize,
                onResizeStart: this.onResizeStart.bind(this),
                onResizing: this.onResizing.bind(this, false),
                onResizeEnd: this.onResizing.bind(this, true)
            });
            destroyResizeFuncs.push(finishedWithResizeFunc);
            if (canAutosize) {
                const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');
                const autoSizeColListener = () => {
                    this.columnModel.autoSizeColumn(this.column, skipHeaderOnAutoSize, "uiColumnResized");
                };
                this.eResize.addEventListener('dblclick', autoSizeColListener);
                const touchListener = new TouchListener(this.eResize);
                touchListener.addEventListener(TouchListener.EVENT_DOUBLE_TAP, autoSizeColListener);
                this.addDestroyFunc(() => {
                    this.eResize.removeEventListener('dblclick', autoSizeColListener);
                    touchListener.removeEventListener(TouchListener.EVENT_DOUBLE_TAP, autoSizeColListener);
                    touchListener.destroy();
                });
            }
        };
        const removeResize = () => {
            destroyResizeFuncs.forEach(f => f());
            destroyResizeFuncs.length = 0;
        };
        const refresh = () => {
            const resize = this.column.isResizable();
            const autoSize = !this.gridOptionsService.is('suppressAutoSize') && !colDef.suppressAutoSize;
            const propertyChange = resize !== canResize || autoSize !== canAutosize;
            if (propertyChange) {
                canResize = resize;
                canAutosize = autoSize;
                removeResize();
                addResize();
            }
        };
        refresh();
        this.addDestroyFunc(removeResize);
        this.ctrl.addRefreshFunction(refresh);
    }
    onResizing(finished, resizeAmount) {
        const resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        const columnWidths = [{ key: this.column, newWidth: this.resizeStartWidth + resizeAmountNormalised }];
        this.columnModel.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnDragged");
        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    }
    onResizeStart(shiftKey) {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;
        this.comp.addOrRemoveCssClass('ag-column-resizing', true);
    }
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    normaliseResizeAmount(dragChange) {
        let result = dragChange;
        const notPinningLeft = this.pinned !== 'left';
        const pinningRight = this.pinned === 'right';
        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (notPinningLeft) {
                result *= -1;
            }
        }
        else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (pinningRight) {
                result *= -1;
            }
        }
        return result;
    }
}
__decorate([
    Autowired('horizontalResizeService')
], ResizeFeature.prototype, "horizontalResizeService", void 0);
__decorate([
    Autowired('columnModel')
], ResizeFeature.prototype, "columnModel", void 0);
__decorate([
    PostConstruct
], ResizeFeature.prototype, "postConstruct", null);
