import { _setDisplayed } from 'ag-stack';

import { _cancelColumnWidthAnimation } from '../columns/columnWidthAnimation';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { getDragSign } from '../entities/agColumn';
import type { IHeaderResizeFeature } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl, IHeaderCellComp } from '../headerRendering/cells/column/headerCellCtrl';

export class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private resizeStartWidth = 0;
    private resizeStartPinnedWidth = 0;
    private takeFromAdjacent = false;
    private dragSign = 1;

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
        const { pinnedCols, ctrlsSvc, colResize } = beans;

        let newWidth = resizeStartWidth + resizeAmount * this.dragSign;
        // measured from the applied width, which the pinned room below caps
        const actualWidth = key.actualWidth;
        const growth = newWidth - actualWidth;

        if (
            growth > 0 &&
            key.pinnedLane !== 1 &&
            !pinnedCols?.isResizeWithinPinnedSection(key, this.takeFromAdjacent)
        ) {
            const bodyWidth = ctrlsSvc.getGridBodyCtrl().getViewportWidthWithoutScrollbar() - 50;
            // pinned columns that overflowed when the drag started can grow back to their starting width
            const room = Math.max(bodyWidth, this.resizeStartPinnedWidth) - this.getPinnedWidth();
            // fill the remaining space; still set the width so a finished drag completes
            newWidth = actualWidth + Math.min(growth, Math.max(room, 0));
        }

        colResize?.resizeColumn(key, newWidth, this.takeFromAdjacent, finished);

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        this.resizeStartWidth = this.column.actualWidth;
        this.resizeStartPinnedWidth = this.getPinnedWidth();
        this.takeFromAdjacent = this.beans.colResize!.takesFromAdjacent(shiftKey);
        this.dragSign = getDragSign(this.gos.get('enableRtl'), this.column.pinnedLane);

        _cancelColumnWidthAnimation(this.beans);
        this.toggleColumnResizing(true);
    }

    private getPinnedWidth(): number {
        const { pinnedCols } = this.beans;
        return (pinnedCols?.leftWidth ?? 0) + (pinnedCols?.rightWidth ?? 0);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.column.setResizing(resizing);
        this.comp.toggleCss('ag-column-resizing', resizing);
    }
}
