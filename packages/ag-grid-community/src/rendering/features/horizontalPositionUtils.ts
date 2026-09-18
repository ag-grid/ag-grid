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

    const useRightAnchor = !isPrintLayout && (isRtl ? lane !== 0 : lane === 2);

    if (useRightAnchor) {
        if (isRtl) {
            eElement.style.right = `${offset}px`;
        } else {
            const containerWidth = visibleCols.getRightStickyColumnContainerWidth();
            eElement.style.right = `${containerWidth - offset - width}px`;
        }
        eElement.style.left = '';
        return;
    }

    eElement.style.left = `${offset}px`;
    eElement.style.right = '';
}
