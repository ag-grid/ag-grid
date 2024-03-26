import { ColumnModel } from "../../../columns/columnModel";
import { BeanStub } from "../../../context/beanStub";
import { Autowired, PostConstruct } from "../../../context/context";
import { CtrlsService } from "../../../ctrlsService";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { PinnedWidthService } from "../../../gridBodyComp/pinnedWidthService";
import { getInnerWidth, setDisplayed } from "../../../utils/dom";
import { TouchListener } from "../../../widgets/touchListener";
import { HorizontalResizeService } from "../../common/horizontalResizeService";
import { IHeaderResizeFeature } from "../abstractCell/abstractHeaderCellCtrl";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";


export class ResizeFeature extends BeanStub implements IHeaderResizeFeature {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private pinned: ColumnPinnedType;
    private column: Column;
    private eResize: HTMLElement;
    private comp: IHeaderCellComp;

    private lastResizeAmount: number;
    private resizeStartWidth: number;
    private resizeWithShiftKey: boolean;

    private ctrl: HeaderCellCtrl;

    constructor(
        pinned: ColumnPinnedType,
        column: Column,
        eResize: HTMLElement,
        comp: IHeaderCellComp,
        ctrl: HeaderCellCtrl
    ) {
        super();
        this.pinned = pinned;
        this.column = column;
        this.eResize = eResize;
        this.comp = comp;
        this.ctrl = ctrl;
    }

    @PostConstruct
    private postConstruct(): void {
        const destroyResizeFuncs: (() => void)[] = [];

        let canResize: boolean;
        let canAutosize: boolean;

        const addResize = () => {
            setDisplayed(this.eResize, canResize);

            if (!canResize) { return; }

            const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
                eResizeBar: this.eResize,
                onResizeStart: this.onResizeStart.bind(this),
                onResizing: this.onResizing.bind(this, false),
                onResizeEnd: this.onResizing.bind(this, true)
            });
            destroyResizeFuncs.push(finishedWithResizeFunc);

            if (canAutosize) {
                const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

                const autoSizeColListener = () => {
                    this.columnModel.autoSizeColumn(this.column, "uiColumnResized", skipHeaderOnAutoSize);
                };

                this.eResize.addEventListener('dblclick', autoSizeColListener);
                const touchListener: TouchListener = new TouchListener(this.eResize);
                touchListener.addEventListener(TouchListener.EVENT_DOUBLE_TAP, autoSizeColListener);

                destroyResizeFuncs.push(() => {
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
            const autoSize = !this.gos.get('suppressAutoSize') && !this.column.getColDef().suppressAutoSize;
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

    private onResizing(finished: boolean, resizeAmount: number): void {
        const { column: key, lastResizeAmount, resizeStartWidth } = this;

        const resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        const newWidth = resizeStartWidth + resizeAmountNormalised;

        const columnWidths = [{ key, newWidth }];

        if (this.column.getPinned()) {
            const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
            const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
            const bodyWidth = getInnerWidth(this.ctrlsService.getGridBodyCtrl().getBodyViewportElement()) - 50;

            if (leftWidth + rightWidth + (resizeAmountNormalised - lastResizeAmount) > bodyWidth) {
                return;
            }
        }

        this.lastResizeAmount = resizeAmountNormalised;

        this.columnModel.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnResized");

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.getActualWidth();
        this.lastResizeAmount = 0;
        this.resizeWithShiftKey = shiftKey;

        this.toggleColumnResizing(true);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.comp.addOrRemoveCssClass('ag-column-resizing', resizing);
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    private normaliseResizeAmount(dragChange: number): number {
        let result = dragChange;

        const notPinningLeft = this.pinned !== 'left';
        const pinningRight = this.pinned === 'right';

        if (this.gos.get('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (notPinningLeft) {
                result *= -1;
            }
        } else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (pinningRight) {
                result *= -1;
            }
        }

        return result;
    }

}