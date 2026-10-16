import { _setDisplayed } from 'ag-stack';

import { _cancelColumnWidthAnimation } from '../columns/columnWidthAnimation';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { getDragSign } from '../entities/agColumn';
import type { IHeaderResizeFeature } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl, IHeaderCellComp } from '../headerRendering/cells/column/headerCellCtrl';

export class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private resizeStartWidth = 0;
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

    private onResizing(finished: boolean, amount: number): void {
        const { column, resizeStartWidth: startWidth, takeFromAdjacent, beans } = this;
        const change = amount * this.dragSign;
        const held = beans.pinnedCols?.limitResize(column, takeFromAdjacent, change, startWidth) ?? change;
        // set even when capped, so a finished drag completes
        beans.colResize?.resizeColumn(column, startWidth + held, takeFromAdjacent, finished);

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        const { column, beans } = this;
        this.resizeStartWidth = column.actualWidth;
        this.takeFromAdjacent = beans.colResize!.takesFromAdjacent(shiftKey);
        this.dragSign = getDragSign(this.gos.get('enableRtl'), column.pinnedLane);

        _cancelColumnWidthAnimation(beans);
        this.toggleColumnResizing(true);
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.column.setResizing(resizing);
        this.comp.toggleCss('ag-column-resizing', resizing);
    }
}
