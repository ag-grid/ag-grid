import { _setDisplayed } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { IHeaderResizeFeature } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl, IHeaderCellComp } from '../headerRendering/cells/column/headerCellCtrl';

export class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private resizeStartWidth: number;
    private resizeStartPinnedWidth: number;
    private resizeWithShiftKey: boolean;

    constructor(
        private readonly column: AgColumn,
        private readonly eResize: HTMLElement,
        private readonly comp: IHeaderCellComp,
        private readonly ctrl: HeaderCellCtrl
    ) {
        super();
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

            const { horizontalResizeSvc, colAutosize } = this.beans;

            const finishedWithResizeFunc = horizontalResizeSvc!.addResizeBar({
                eResizeBar: this.eResize,
                isColumn: true,
                onResizeStart: this.onResizeStart.bind(this),
                onResizing: this.onResizing.bind(this, false),
                onResizeEnd: this.onResizing.bind(this, true),
            });
            destroyResizeFuncs.push(finishedWithResizeFunc);

            if (canAutosize && colAutosize) {
                destroyResizeFuncs.push(colAutosize.addColumnAutosizeListeners(this.eResize, this.column));
            }
        };

        const removeResize = () => {
            for (const f of destroyResizeFuncs) {
                f();
            }
            destroyResizeFuncs.length = 0;
        };

        const refresh = () => {
            const resize = this.column.isResizable();
            const autoSize = !this.gos.get('suppressAutoSize') && !this.column.colDef.suppressAutoSize;
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
        const { column: key, resizeStartWidth, beans } = this;
        const { pinnedCols, colResize } = beans;

        let newWidth = resizeStartWidth + this.normaliseResizeAmount(resizeAmount);
        // measured from the applied width, as a width outside min/max is never applied
        const actualWidth = key.getActualWidth();
        const growth = newWidth - actualWidth;

        if (
            pinnedCols &&
            growth > 0 &&
            key.pinnedLane !== 1 &&
            !pinnedCols.isShiftResizeWithinPinnedSection(key, this.resizeWithShiftKey)
        ) {
            // still set the width when no growth fits, so a finished drag completes
            newWidth = actualWidth + pinnedCols.getPinnedResizeGrowth(growth, this.resizeStartPinnedWidth);
        }

        colResize?.setColumnWidths([{ key, newWidth }], this.resizeWithShiftKey, finished, 'uiColumnResized');

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeStartPinnedWidth = this.beans.pinnedCols?.getPinnedWidth() ?? 0;
        this.resizeWithShiftKey = shiftKey;

        this.toggleColumnResizing(true);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.column.setResizing(resizing);
        this.comp.toggleCss('ag-column-resizing', resizing);
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    private normaliseResizeAmount(dragChange: number): number {
        let result = dragChange;

        const lane = this.column.pinnedLane;
        const notPinningLeft = lane !== 0;
        const pinningRight = lane === 2;

        if (this.gos.get('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (notPinningLeft) {
                result *= -1;
            }
        }
        // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
        else if (pinningRight) {
            result *= -1;
        }

        return result;
    }
}
