import type { ColumnAutosizeService } from '../../../columns/columnAutosizeService';
import type { ColumnSizeService } from '../../../columns/columnSizeService';
import { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { CtrlsService } from '../../../ctrlsService';
import type { AgColumn } from '../../../entities/agColumn';
import type { PinnedWidthService } from '../../../gridBodyComp/pinnedWidthService';
import type { ColumnPinnedType } from '../../../interfaces/iColumn';
import { _getInnerWidth, _setDisplayed } from '../../../utils/dom';
import { TouchListener } from '../../../widgets/touchListener';
import type { HorizontalResizeService } from '../../common/horizontalResizeService';
import type { IHeaderResizeFeature } from '../abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl, IHeaderCellComp } from './headerCellCtrl';

export class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private horizontalResizeService: HorizontalResizeService;
    private pinnedWidthService: PinnedWidthService;
    private ctrlsService: CtrlsService;
    private columnSizeService: ColumnSizeService;
    private columnAutosizeService: ColumnAutosizeService;

    public wireBeans(beans: BeanCollection) {
        this.horizontalResizeService = beans.horizontalResizeService;
        this.pinnedWidthService = beans.pinnedWidthService;
        this.ctrlsService = beans.ctrlsService;
        this.columnSizeService = beans.columnSizeService;
        this.columnAutosizeService = beans.columnAutosizeService;
    }

    private pinned: ColumnPinnedType;
    private column: AgColumn;
    private eResize: HTMLElement;
    private comp: IHeaderCellComp;

    private lastResizeAmount: number;
    private resizeStartWidth: number;
    private resizeWithShiftKey: boolean;

    private ctrl: HeaderCellCtrl;

    constructor(
        pinned: ColumnPinnedType,
        column: AgColumn,
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

    public postConstruct(): void {
        const destroyResizeFuncs: (() => void)[] = [];

        let canResize: boolean;
        let canAutosize: boolean;

        const addResize = () => {
            _setDisplayed(this.eResize, canResize);

            if (!canResize) {
                return;
            }

            const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
                eResizeBar: this.eResize,
                onResizeStart: this.onResizeStart.bind(this),
                onResizing: this.onResizing.bind(this, false),
                onResizeEnd: this.onResizing.bind(this, true),
            });
            destroyResizeFuncs.push(finishedWithResizeFunc);

            if (canAutosize) {
                const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

                const autoSizeColListener = () => {
                    this.columnAutosizeService.autoSizeColumn(this.column, 'uiColumnResized', skipHeaderOnAutoSize);
                };

                this.eResize.addEventListener('dblclick', autoSizeColListener);
                const touchListener: TouchListener = new TouchListener(this.eResize);
                touchListener.addEventListener('doubleTap', autoSizeColListener);

                destroyResizeFuncs.push(() => {
                    this.eResize.removeEventListener('dblclick', autoSizeColListener);
                    touchListener.removeEventListener('doubleTap', autoSizeColListener);
                    touchListener.destroy();
                });
            }
        };

        const removeResize = () => {
            destroyResizeFuncs.forEach((f) => f());
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
        this.ctrl.setRefreshFunction('resize', refresh);
    }

    private onResizing(finished: boolean, resizeAmount: number): void {
        const { column: key, lastResizeAmount, resizeStartWidth } = this;

        const resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        const newWidth = resizeStartWidth + resizeAmountNormalised;

        const columnWidths = [{ key, newWidth }];

        if (this.column.getPinned()) {
            const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
            const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
            const bodyWidth = _getInnerWidth(this.ctrlsService.getGridBodyCtrl().getBodyViewportElement()) - 50;

            if (leftWidth + rightWidth + (resizeAmountNormalised - lastResizeAmount) > bodyWidth) {
                return;
            }
        }

        this.lastResizeAmount = resizeAmountNormalised;

        this.columnSizeService.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, 'uiColumnResized');

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
