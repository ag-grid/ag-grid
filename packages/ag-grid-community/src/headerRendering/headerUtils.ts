import type { ColumnModel } from '../columns/columnModel';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { BeanCollection } from '../context/context';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { HeaderPosition } from '../interfaces/iHeaderPosition';
import type { HeaderRowCtrl } from './row/headerRowCtrl';

// + gridPanel -> for resizing the body and setting top margin
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getHeaderRowCount(colModel: ColumnModel): number {
    if (!colModel.ready) {
        return -1;
    }

    return colModel.colsTreeDepth + 1;
}

export function getFocusHeaderRowCount(beans: BeanCollection): number {
    return beans.ctrlsSvc.getHeaderRowContainerCtrl()?.getRowCount() ?? 0;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getAriaHeaderRowCount(beans: BeanCollection): number {
    const { ctrlsSvc, colModel, filterManager } = beans;
    const renderedHeaderRowCount = ctrlsSvc.getHeaderRowContainerCtrl()?.getRowCount();
    const configuredHeaderRowCount =
        Math.max(getHeaderRowCount(colModel), 0) + (filterManager?.hasFloatingFilters() ? 1 : 0);
    const baseHeaderRowCount = renderedHeaderRowCount ?? configuredHeaderRowCount;
    return baseHeaderRowCount + (filterManager?.getHeaderRowCount() ?? 0);
}

export function getGroupRowsHeight(beans: BeanCollection): number[] {
    const heights: number[] = [];
    const headerRowContainerCtrl = beans.ctrlsSvc.getHeaderRowContainerCtrl();
    if (!headerRowContainerCtrl) {
        return heights;
    }

    const groupRowCount = headerRowContainerCtrl.getGroupRowCount() || 0;

    for (let i = 0; i < groupRowCount; i++) {
        const headerRowCtrl = headerRowContainerCtrl.getGroupRowCtrlAtIndex(i);

        const currentHeightAtPos = heights[i];
        if (headerRowCtrl) {
            const newHeight = getColumnGroupHeaderRowHeight(beans, headerRowCtrl);
            if (currentHeightAtPos == null || newHeight > currentHeightAtPos) {
                heights[i] = newHeight;
            }
        }
    }

    return heights;
}

function getColumnGroupHeaderRowHeight(beans: BeanCollection, headerRowCtrl: HeaderRowCtrl): number {
    const defaultHeight = beans.colModel.pivotMode ? getPivotGroupHeaderHeight(beans) : getGroupHeaderHeight(beans);
    let maxDisplayedHeight = defaultHeight;
    const headerRowCellCtrls = headerRowCtrl.getHeaderCellCtrls();
    for (const headerCellCtrl of headerRowCellCtrls) {
        const { column } = headerCellCtrl;
        const height = column.autoHeaderHeight;
        if (height != null && height > maxDisplayedHeight && column.isAutoHeaderHeight()) {
            maxDisplayedHeight = height;
        }
    }
    return maxDisplayedHeight;
}

export function getColumnHeaderRowHeight(beans: BeanCollection): number {
    const defaultHeight = beans.colModel.pivotMode ? getPivotHeaderHeight(beans) : getHeaderHeight(beans);
    let maxDisplayedHeight = defaultHeight;
    const allCols = beans.colModel.getAllCols();
    for (let i = 0, len = allCols.length; i < len; ++i) {
        const col = allCols[i];
        const height = col.autoHeaderHeight;
        if (height != null && height > maxDisplayedHeight && col.isAutoHeaderHeight()) {
            maxDisplayedHeight = height;
        }
    }
    return maxDisplayedHeight;
}

export function getHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('headerHeight') ?? beans.environment.getDefaultHeaderHeight();
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getFloatingFiltersHeight(beans: BeanCollection): number {
    return beans.gos.get('floatingFiltersHeight') ?? getHeaderHeight(beans);
}

function getGroupHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('groupHeaderHeight') ?? getHeaderHeight(beans);
}

function getPivotHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('pivotHeaderHeight') ?? getHeaderHeight(beans);
}

function getPivotGroupHeaderHeight(beans: BeanCollection): number {
    return beans.gos.get('pivotGroupHeaderHeight') ?? getGroupHeaderHeight(beans);
}

export function isHeaderPositionEqual(headerPosA: HeaderPosition, headerPosB: HeaderPosition): boolean {
    return headerPosA.headerRowIndex === headerPosB.headerRowIndex && headerPosA.column === headerPosB.column;
}

export function isHeaderPosition(position: unknown): position is HeaderPosition {
    return (position as HeaderPosition)?.headerRowIndex != null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface PinnedSectionWidths {
    leftWidth: number;
    centerWidth: number;
    rightWidth: number;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function getPinnedSectionWidths(visibleCols: VisibleColsService, isPrint: boolean): PinnedSectionWidths {
    if (isPrint) {
        return { leftWidth: 0, centerWidth: visibleCols.bodyWidth, rightWidth: 0 };
    }
    return {
        leftWidth: visibleCols.getLeftStickyColumnContainerWidth(),
        centerWidth: visibleCols.bodyWidth,
        rightWidth: visibleCols.getRightStickyColumnContainerWidth(),
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface PinnedSectionElements {
    ePinnedLeft: HTMLElement;
    eScrolling: HTMLElement;
    ePinnedRight: HTMLElement;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface PinnedSectionWidthsCache {
    pinnedLeftWidth: number | undefined;
    centerWidth: number | undefined;
    pinnedRightWidth: number | undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function updatePinnedSectionWidths(
    visibleCols: VisibleColsService,
    isPrint: boolean,
    elements: PinnedSectionElements,
    cache: PinnedSectionWidthsCache
): void {
    const { ePinnedLeft, eScrolling, ePinnedRight } = elements;
    const { leftWidth, centerWidth, rightWidth } = getPinnedSectionWidths(visibleCols, isPrint);

    if (cache.pinnedLeftWidth !== leftWidth) {
        ePinnedLeft.style.width = leftWidth + 'px';
        ePinnedLeft.style.display = leftWidth > 0 || isPrint ? '' : 'none';
        cache.pinnedLeftWidth = leftWidth;
    }
    if (cache.centerWidth !== centerWidth) {
        eScrolling.style.width = centerWidth + 'px';
        cache.centerWidth = centerWidth;
    }
    if (cache.pinnedRightWidth !== rightWidth) {
        ePinnedRight.style.width = rightWidth + 'px';
        ePinnedRight.style.display = rightWidth > 0 || isPrint ? '' : 'none';
        cache.pinnedRightWidth = rightWidth;
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface PinnedSections<T> {
    left: T[];
    center: T[];
    right: T[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function partitionByPinned<T>(items: T[], getPinned: (item: T) => ColumnPinnedType): PinnedSections<T> {
    const left: T[] = [];
    const center: T[] = [];
    const right: T[] = [];

    for (const item of items) {
        const pinned = getPinned(item);
        if (pinned === 'left') {
            left.push(item);
        } else if (pinned === 'right') {
            right.push(item);
        } else {
            center.push(item);
        }
    }

    return { left, center, right };
}
