import { ColumnModel } from "../../../columns/columnModel";
import { Constants } from "../../../constants/constants";
import { BeanStub } from "../../../context/beanStub";
import { Autowired, PostConstruct } from "../../../context/context";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { setDisplayed } from "../../../utils/dom";
import { TouchListener } from "../../../widgets/touchListener";
import { HorizontalResizeService } from "../../common/horizontalResizeService";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";

export class ResizeFeature extends BeanStub {

    @Autowired('horizontalResizeService') private horizontalResizeService: HorizontalResizeService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private pinned: ColumnPinnedType;
    private column: Column;
    private eResize: HTMLElement;
    private comp: IHeaderCellComp;

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
        const colDef = this.column.getColDef();

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
                const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');

                const autoSizeColListener = () => {
                    this.columnModel.autoSizeColumn(this.column, skipHeaderOnAutoSize, "uiColumnResized");
                };

                this.eResize.addEventListener('dblclick', autoSizeColListener);
                const touchListener: TouchListener = new TouchListener(this.eResize);
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

    private onResizing(finished: boolean, resizeAmount: number): void {
        const resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        const columnWidths = [{ key: this.column, newWidth: this.resizeStartWidth + resizeAmountNormalised }];
        this.columnModel.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnDragged");

        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;

        this.comp.addOrRemoveCssClass('ag-column-resizing', true);
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    private normaliseResizeAmount(dragChange: number): number {
        let result = dragChange;

        const notPinningLeft = this.pinned !== Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;

        if (this.gridOptionsService.is('enableRtl')) {
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