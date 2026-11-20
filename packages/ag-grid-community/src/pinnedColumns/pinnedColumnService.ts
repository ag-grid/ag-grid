import { dispatchColumnPinnedEvent } from '../columns/columnEventUtils';
import { isRowNumberCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _laneOfPinned, getShiftPair, isColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { getColGroupAfter } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { _isDomLayout } from '../gridOptionsUtils';
import type { ProcessUnpinnedColumnsParams } from '../interfaces/iCallbackParams';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';

/** Minimum center viewport width (in px) reserved when pinned columns are present. */
export const MIN_CENTER_VIEWPORT_WIDTH = 50;

const USER_AUTOSIZE_SOURCES = new Set<ColumnEventType>(['uiColumnResized', 'columnMenu', 'contextMenu', 'toolPanelUi']);

export class PinnedColumnService extends BeanStub implements NamedBean {
    beanName = 'pinnedCols' as const;

    private gridBodyCtrl?: GridBodyCtrl;

    public leftWidth: number;
    public rightWidth: number;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
        });
        this.addManagedPropertyListener('domLayout', () => {
            const visibleCols = this.beans.visibleCols;
            this.refreshWidths(
                visibleCols.getLeftStickyColumnContainerWidth(),
                visibleCols.getRightStickyColumnContainerWidth()
            );
        });
    }

    /** Called by the body widths' layout with the section widths, and on a `domLayout` change (no column moves). */
    public refreshWidths(leftWidth: number, rightWidth: number): void {
        const { gos, eventSvc } = this.beans;
        const printLayout = _isDomLayout(gos, 'print');

        const newLeftWidth = printLayout ? 0 : leftWidth;
        const newRightWidth = printLayout ? 0 : rightWidth;
        const leftChanged = newLeftWidth !== this.leftWidth;
        const rightChanged = newRightWidth !== this.rightWidth;
        if (!leftChanged && !rightChanged) {
            return;
        }
        this.leftWidth = newLeftWidth;
        this.rightWidth = newRightWidth;
        this.gridBodyCtrl?.onPinnedWidthChanged();

        // Unused by the grid; still raised as applications may listen to them by name.
        if (leftChanged) {
            eventSvc.dispatchEvent({ type: 'leftPinnedWidthChanged' });
        }
        if (rightChanged) {
            eventSvc.dispatchEvent({ type: 'rightPinnedWidthChanged' });
        }
    }

    /** Unpins the pinned columns the viewport has no room for; whether it unpinned any. `viewportWidth`: just
     *  measured, else measured here, as a resize may not have been observed yet. */
    public keepPinnedColumnsNarrowerThanViewport(viewportWidth: number | undefined): boolean {
        if (!this.gridBodyCtrl) {
            return false;
        }

        const bodyWidth = this.gridBodyCtrl.getViewportWidthWithoutScrollbar(viewportWidth);

        if (bodyWidth <= MIN_CENTER_VIEWPORT_WIDTH) {
            return false;
        }

        const processedColumnsToRemove = this.getPinnedColumnsOverflowingViewport(
            bodyWidth - MIN_CENTER_VIEWPORT_WIDTH
        );
        const processUnpinnedColumns = this.gos.getCallback('processUnpinnedColumns');
        const { columns, hasLockedPinned } = processedColumnsToRemove;

        let columnsToRemove = columns;

        if (!columnsToRemove.length && !hasLockedPinned) {
            return false;
        }

        if (processUnpinnedColumns) {
            const params: WithoutGridCommon<ProcessUnpinnedColumnsParams> = {
                columns: columnsToRemove,
                viewportWidth: bodyWidth,
            };
            columnsToRemove = processUnpinnedColumns(params) as AgColumn[];
        }

        columnsToRemove = columnsToRemove?.filter((col) => !isRowNumberCol(col));
        if (!columnsToRemove?.length) {
            return false;
        }
        this.setColsPinned(columnsToRemove, null, 'viewportSizeFeature');
        return true;
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

        const actualPinned = toPinnedSide(pinned);

        let updatedCols: AgColumn[] | null = null;
        colModel.beginColUpdate();
        try {
            for (let i = 0, len = keys.length; i < len; ++i) {
                const key = keys[i];
                const column = key ? colModel.getCol(key) : null;
                if (column && column.pinned !== actualPinned) {
                    this.setColPinned(column, actualPinned, source);
                    updatedCols ??= [];
                    updatedCols.push(column);
                }
            }

            if (updatedCols) {
                // Slide the pinned/unpinned cols and the gap they leave, rather than jumping.
                colModel.animateColUpdate();
                visibleCols.refresh(source, false);
                dispatchColumnPinnedEvent(this.eventSvc, updatedCols, source);
                this.keepPinnedColumnsNarrowerThanViewport(undefined);
            }
        } finally {
            colModel.endColUpdate();
        }
    }

    public initCol(column: AgColumn): void {
        const { pinned, initialPinned } = column.colDef;
        writeColPinned(column, pinned !== undefined ? pinned : initialPinned);
    }

    public setColPinned(column: AgColumn, pinned: ColumnPinnedType, source: ColumnEventType): void {
        writeColPinned(column, pinned);
        column.dispatchStateUpdatedEvent('pinned', source);
    }

    /**
     * `change` to a user resize of `column`, held to the pinned room: a pinned column grows, or a centre one shrinks into
     * a pinned neighbour, only as far as the room left, counting as free what the resize took since `startWidth`.
     */
    public limitResize(
        column: AgColumn | AgColumnGroup,
        takeFromAdjacent: boolean,
        change: number,
        startWidth?: number
    ): number {
        const centre = column.pinnedLane === 1;
        // taking from a pinned neighbour keeps the pinned total
        const limited = centre
            ? change < 0 && takeFromAdjacent && this.isNextPinned(column)
            : change > 0 && !(takeFromAdjacent && this.isNextPinned(column));
        if (!limited) {
            return change;
        }
        // read per move, as the viewport or another pinned column can change mid-drag
        const resized = startWidth === undefined ? 0 : column.getActualWidth() - startWidth;
        return centre ? Math.max(change, -this.getPinnedRoom(-resized)) : Math.min(change, this.getPinnedRoom(resized));
    }

    /** Whether an auto-size from `source` stops at the pinned room: a resize handle's or a menu's does, the API's not. */
    public limitsAutoSize(source: ColumnEventType): boolean {
        return USER_AUTOSIZE_SOURCES.has(source);
    }

    /** How much wider the pinned columns can grow before the centre narrows below its minimum, `freed` px of them not
     *  counted. Reads the observed viewport width, not the layout, so a drag can ask on every move. */
    public getPinnedRoom(freed: number): number {
        // print layout lays every column out in the centre, so nothing pinned can crowd it
        if (_isDomLayout(this.gos, 'print')) {
            return Infinity;
        }
        const gridBodyCtrl = this.gridBodyCtrl;
        const viewportWidth = gridBodyCtrl
            ? gridBodyCtrl.getViewportWidthWithoutScrollbar(gridBodyCtrl.getReportedViewportWidth())
            : 0;
        return Math.max(viewportWidth - MIN_CENTER_VIEWPORT_WIDTH - this.leftWidth - this.rightWidth + freed, 0);
    }

    private isNextPinned(column: AgColumn | AgColumnGroup): boolean {
        const visibleCols = this.beans.visibleCols;
        if (isColumn(column)) {
            const next = getShiftPair(visibleCols, column);
            return !!next && next.pinnedLane !== 1;
        }
        // a next group with no resizable column gives nothing, so the group resizes alone
        const next = getColGroupAfter(visibleCols, column);
        return !!next && next.pinnedLane !== 1 && next.isResizable();
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
                spaceNecessary -= currentColumn.actualWidth;
                columnsToRemove.push(currentColumn);
            }

            if (indexLeft < pinnedLeftColumns.length && spaceNecessary > 0) {
                const currentColumn = pinnedLeftColumns[indexLeft++];
                if (currentColumn.colDef.lockPinned) {
                    hasLockedPinned = true;
                    continue;
                }
                spaceNecessary -= currentColumn.actualWidth;
                columnsToRemove.push(currentColumn);
            }
        }

        return { columns: columnsToRemove, hasLockedPinned };
    }
}

const toPinnedSide = (pinned: ColumnPinnedType): 'left' | 'right' | null => {
    if (pinned === true || pinned === 'left') {
        return 'left';
    }
    return pinned === 'right' ? 'right' : null;
};

const writeColPinned = (column: AgColumn, pinned: ColumnPinnedType): void => {
    const side = toPinnedSide(pinned);
    column.pinned = side;
    column.pinnedLane = _laneOfPinned(side);
};
