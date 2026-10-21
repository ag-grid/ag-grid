import type { VisibleColsService } from '../../columns/visibleColsService';
import type { ColumnLane } from '../../entities/agColumn';

/** Where a column's `left` lands in print layout, which draws every lane in one container. */
export function getPrintLayoutOffset(
    left: number | null,
    lane: ColumnLane,
    width: number,
    isRtl: boolean,
    visibleCols: VisibleColsService
): number | null {
    if (left == null) {
        return null;
    }

    let physicalLeft = left;
    if (isRtl) {
        let sectionWidth: number;
        if (lane === 0) {
            sectionWidth = visibleCols.getLeftStickyColumnContainerWidth();
        } else if (lane === 2) {
            sectionWidth = visibleCols.getRightStickyColumnContainerWidth();
        } else {
            sectionWidth = visibleCols.bodyWidth;
        }
        physicalLeft = sectionWidth - left - width;
    }

    if (lane === 0) {
        return physicalLeft;
    }

    const leftWidth = visibleCols.getLeftStickyColumnContainerWidth();
    if (lane === 2) {
        return leftWidth + visibleCols.bodyWidth + physicalLeft;
    }

    return leftWidth + physicalLeft;
}

export const isRightAnchored = (lane: ColumnLane, isRtl: boolean, isPrintLayout: boolean): boolean =>
    !isPrintLayout && (isRtl ? lane !== 0 : lane === 2);

/** The `right` to write when right-anchored, else the `left`. */
export const getAnchoredPosition = (
    offset: number,
    width: number,
    rightAnchored: boolean,
    isRtl: boolean,
    visibleCols: VisibleColsService
): number => (rightAnchored && !isRtl ? visibleCols.getRightStickyColumnContainerWidth() - offset - width : offset);
