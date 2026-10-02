import type { VisibleColsService } from '../../columns/visibleColsService';
import type { ColumnLane } from '../../entities/agColumn';

interface HorizontalOffsetParams {
    left: number | null;
    lane: ColumnLane;
    width: number;
    isPrintLayout: boolean;
    isRtl: boolean;
    visibleCols: VisibleColsService;
}

interface ApplyHorizontalPositionParams {
    offset: number;
    lane: ColumnLane;
    width: number;
    isPrintLayout: boolean;
    isRtl: boolean;
    visibleCols: VisibleColsService;
}

export function getResolvedHorizontalOffset(params: HorizontalOffsetParams): number | null {
    const { left, lane, width, isPrintLayout, isRtl, visibleCols } = params;
    if (left == null || !isPrintLayout) {
        return left;
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

export function applyHorizontalPosition(eElement: HTMLElement, params: ApplyHorizontalPositionParams): void {
    const { offset, lane, width, isPrintLayout, isRtl, visibleCols } = params;

    const rightAnchored = isRightAnchored(lane, isRtl, isPrintLayout);
    const position = getAnchoredPosition(offset, width, rightAnchored, isRtl, visibleCols);
    eElement.style.left = rightAnchored ? '' : `${position}px`;
    eElement.style.right = rightAnchored ? `${position}px` : '';
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
