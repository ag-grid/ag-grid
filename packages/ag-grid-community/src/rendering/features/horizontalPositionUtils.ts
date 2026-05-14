import type { VisibleColsService } from '../../columns/visibleColsService';
import type { ColumnPinnedType } from '../../interfaces/iColumn';

interface HorizontalOffsetParams {
    left: number | null;
    pinned: ColumnPinnedType;
    width: number;
    isPrintLayout: boolean;
    isRtl: boolean;
    visibleCols: VisibleColsService;
}

interface ApplyHorizontalPositionParams {
    offset: number;
    pinned: ColumnPinnedType;
    width: number;
    isPrintLayout: boolean;
    isRtl: boolean;
    visibleCols: VisibleColsService;
}

export function getResolvedHorizontalOffset(params: HorizontalOffsetParams): number | null {
    const { left, pinned, width, isPrintLayout, isRtl, visibleCols } = params;
    if (left == null || !isPrintLayout) {
        return left;
    }

    let physicalLeft = left;
    if (isRtl) {
        let sectionWidth: number;
        if (pinned === 'left') {
            sectionWidth = visibleCols.getLeftStickyColumnContainerWidth();
        } else if (pinned === 'right') {
            sectionWidth = visibleCols.getRightStickyColumnContainerWidth();
        } else {
            sectionWidth = visibleCols.bodyWidth;
        }
        physicalLeft = sectionWidth - left - width;
    }

    if (pinned === 'left') {
        return physicalLeft;
    }

    const leftWidth = visibleCols.getLeftStickyColumnContainerWidth();
    if (pinned === 'right') {
        return leftWidth + visibleCols.bodyWidth + physicalLeft;
    }

    return leftWidth + physicalLeft;
}

export function applyHorizontalPosition(eElement: HTMLElement, params: ApplyHorizontalPositionParams): void {
    const { offset, pinned, width, isPrintLayout, isRtl, visibleCols } = params;

    const useRightAnchor = !isPrintLayout && (isRtl ? pinned !== 'left' : pinned === 'right');

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
