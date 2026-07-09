import { dispatchColumnPinnedEvent } from '../columns/columnEventUtils';
import { isRowNumberCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { SetPinnedWidthFeature } from '../gridBodyComp/rowContainer/setPinnedWidthFeature';
import { _isDomLayout } from '../gridOptionsUtils';
import type { ProcessUnpinnedColumnsParams } from '../interfaces/iCallbackParams';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';

/** Minimum center viewport width (in px) reserved when pinned columns are present. */
export const MIN_CENTER_VIEWPORT_WIDTH = 50;

export class PinnedColumnService extends BeanStub implements NamedBean {
    beanName = 'pinnedCols' as const;

    private gridBodyCtrl?: GridBodyCtrl;

    public leftWidth: number;
    public rightWidth: number;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
        });
        const listener = this.checkContainerWidths.bind(this);
        this.addManagedEventListeners({
            displayedColumnsChanged: listener,
            displayedColumnsWidthChanged: listener,
            columnPinned: this.keepPinnedColumnsNarrowerThanViewport.bind(this),
        });
        this.addManagedPropertyListener('domLayout', listener);
    }

    private checkContainerWidths() {
        const { gos, visibleCols, eventSvc } = this.beans;
        const printLayout = _isDomLayout(gos, 'print');

        const newLeftWidth = printLayout ? 0 : visibleCols.getLeftStickyColumnContainerWidth();
        const newRightWidth = printLayout ? 0 : visibleCols.getRightStickyColumnContainerWidth();

        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            eventSvc.dispatchEvent({ type: 'leftPinnedWidthChanged' });
        }

        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            eventSvc.dispatchEvent({ type: 'rightPinnedWidthChanged' });
        }
    }

    public keepPinnedColumnsNarrowerThanViewport(): void {
        if (!this.gridBodyCtrl) {
            return;
        }

        const bodyWidth = this.getAvailableViewportWidth();

        if (bodyWidth <= MIN_CENTER_VIEWPORT_WIDTH) {
            return;
        }

        const processedColumnsToRemove = this.getPinnedColumnsOverflowingViewport(
            bodyWidth - MIN_CENTER_VIEWPORT_WIDTH
        );
        const processUnpinnedColumns = this.gos.getCallback('processUnpinnedColumns');
        const { columns, hasLockedPinned } = processedColumnsToRemove;

        let columnsToRemove = columns;

        if (!columnsToRemove.length && !hasLockedPinned) {
            return;
        }

        if (processUnpinnedColumns) {
            const params: WithoutGridCommon<ProcessUnpinnedColumnsParams> = {
                columns: columnsToRemove,
                viewportWidth: bodyWidth,
            };
            columnsToRemove = processUnpinnedColumns(params) as AgColumn[];
        }

        if (!columnsToRemove?.length) {
            return;
        }

        columnsToRemove = columnsToRemove.filter((col) => !isRowNumberCol(col));
        this.setColsPinned(columnsToRemove, null, 'viewportSizeFeature');
    }

    public createPinnedWidthFeature(isLeft: boolean, ...elements: (HTMLElement | undefined)[]): SetPinnedWidthFeature {
        return new SetPinnedWidthFeature(isLeft, elements);
    }

    public setColsPinned(keys: ColKey[], pinned: ColumnPinnedType, source: ColumnEventType): void {
        const { colModel, visibleCols, gos } = this.beans;
        if (!colModel.ready) {
            return;
        }
        if (!keys?.length) {
            return;
        }

        if (_isDomLayout(gos, 'print')) {
            this.warn(37);
            return;
        }

        let actualPinned: ColumnPinnedType;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        } else if (pinned === 'right') {
            actualPinned = 'right';
        } else {
            actualPinned = null;
        }

        const updatedCols: AgColumn[] = [];

        for (const key of keys) {
            if (!key) {
                continue;
            }
            const column = colModel.getCol(key);
            if (!column) {
                continue;
            }

            if (column.getPinned() !== actualPinned) {
                this.setColPinned(column, actualPinned);
                updatedCols.push(column);
            }
        }

        if (updatedCols.length) {
            visibleCols.refresh(source, false);
            dispatchColumnPinnedEvent(this.eventSvc, updatedCols, source);
        }
    }

    public initCol(column: AgColumn): void {
        const { pinned, initialPinned } = column.colDef;
        if (pinned !== undefined) {
            this.setColPinned(column, pinned);
        } else {
            this.setColPinned(column, initialPinned);
        }
    }

    public setColPinned(column: AgColumn, pinned: ColumnPinnedType): void {
        if (pinned === true || pinned === 'left') {
            column.pinned = 'left';
        } else if (pinned === 'right') {
            column.pinned = 'right';
        } else {
            column.pinned = null;
        }
        column.dispatchStateUpdatedEvent('pinned');
    }

    public getHeaderResizeDiff(diff: number, column: AgColumn | AgColumnGroup): number {
        const pinned = column.getPinned();
        if (pinned) {
            const { leftWidth, rightWidth } = this;

            const bodyWidth = this.getAvailableViewportWidth() - MIN_CENTER_VIEWPORT_WIDTH;

            if (leftWidth + rightWidth + diff > bodyWidth) {
                if (bodyWidth > leftWidth + rightWidth) {
                    // allow body width to ignore resize multiplier and fill space for last tick
                    diff = bodyWidth - leftWidth - rightWidth;
                } else {
                    return 0;
                }
            }
        }

        return diff;
    }

    private getAvailableViewportWidth(): number {
        return this.gridBodyCtrl?.getViewportWidthWithoutScrollbar() ?? 0;
    }

    private getPinnedColumnsOverflowingViewport(viewportWidth: number): {
        columns: AgColumn[];
        hasLockedPinned: boolean;
    } {
        const pinnedRightWidth = this.rightWidth ?? 0;
        const pinnedLeftWidth = this.leftWidth ?? 0;
        const totalPinnedWidth = pinnedRightWidth + pinnedLeftWidth;
        let hasLockedPinned: boolean = false;

        if (totalPinnedWidth < viewportWidth) {
            return { columns: [], hasLockedPinned };
        }

        const { visibleCols } = this.beans;
        const pinnedLeftColumns = [...visibleCols.leftCols];
        const pinnedRightColumns = [...visibleCols.rightCols];

        let indexRight = 0;
        let indexLeft = 0;
        const totalWidthRemoved = 0;

        const columnsToRemove: AgColumn[] = [];

        let spaceNecessary = totalPinnedWidth - totalWidthRemoved - viewportWidth;

        while ((indexLeft < pinnedLeftColumns.length || indexRight < pinnedRightColumns.length) && spaceNecessary > 0) {
            if (indexRight < pinnedRightColumns.length) {
                const currentColumn = pinnedRightColumns[indexRight++];
                if (currentColumn.colDef.lockPinned) {
                    hasLockedPinned = true;
                    continue;
                }
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }

            if (indexLeft < pinnedLeftColumns.length && spaceNecessary > 0) {
                const currentColumn = pinnedLeftColumns[indexLeft++];
                if (currentColumn.colDef.lockPinned) {
                    hasLockedPinned = true;
                    continue;
                }
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }
        }

        return { columns: columnsToRemove, hasLockedPinned };
    }
}
