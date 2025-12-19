import { _getScrollbarWidth } from '../agStack/utils/browser';

export function _shouldShowHorizontalScroll(
    horizontalElement: HTMLElement,
    verticalScrollElement?: HTMLElement,
    scrollbarWidth: number = _getScrollbarWidth() || 0
): boolean {
    const overflowWidth = getHorizontalOverflow(horizontalElement);
    if (overflowWidth <= 0) {
        return false;
    }

    if (!verticalScrollElement || scrollbarWidth === 0) {
        return true;
    }

    const verticalOverflow = getVerticalOverflow(verticalScrollElement);
    if (verticalOverflow <= 0) {
        return true;
    }

    if (overflowWidth <= scrollbarWidth) {
        const verticalCausedByHorizontal = isScrollbarCausedByOppositeAxis({
            candidateScrollSize: verticalScrollElement.scrollHeight,
            candidateClientSize: verticalScrollElement.clientHeight,
            candidateOverflow: verticalOverflow,
            scrollbarWidth,
            oppositeOverflowing: overflowWidth > 0,
        });

        if (verticalCausedByHorizontal) {
            // If the vertical scrollbar only exists because of the horizontal scrollbar,
            // then the horizontal overflow we are seeing should not be there.
            return false;
        }

        // At this point the vertical scrollbar should be rendered. Even if the content would fit
        // without the vertical scrollbar, we still need to show the horizontal scrollbar
        // because the reduced width is a real constraint.
        const widthWithoutVerticalScrollbar = horizontalElement.clientWidth + scrollbarWidth;
        return horizontalElement.scrollWidth <= widthWithoutVerticalScrollbar;
    }

    return true;
}

/**
 * Determines vertical scrollbar visibility while accounting for the space taken by a horizontal scrollbar
 * that live on a different element.
 */
export function _shouldShowVerticalScroll(
    verticalElement: HTMLElement,
    horizontalScrollElement?: HTMLElement,
    scrollbarWidth: number = _getScrollbarWidth() || 0
): boolean {
    const overflowHeight = getVerticalOverflow(verticalElement);
    if (overflowHeight <= 0) {
        return false;
    }

    if (!horizontalScrollElement || scrollbarWidth === 0) {
        return true;
    }

    const overflowWidth = getHorizontalOverflow(horizontalScrollElement);
    if (overflowWidth <= 0) {
        return true;
    }

    if (overflowHeight <= scrollbarWidth) {
        const horizontalCausedByVertical = isScrollbarCausedByOppositeAxis({
            candidateScrollSize: horizontalScrollElement.scrollWidth,
            candidateClientSize: horizontalScrollElement.clientWidth,
            candidateOverflow: overflowWidth,
            scrollbarWidth,
            oppositeOverflowing: overflowHeight > 0,
        });

        if (horizontalCausedByVertical) {
            // If the horizontal scrollbar only exists because of the vertical scrollbar,
            // then the horizontal overflow we are seeing should not be there.
            return false;
        }

        // At this point the horizontal scrollbar should be rendered. Even if the content would fit without
        // the horizontal scrollbar, we still need to show the vertical scrollbar because the reduced
        // height is a real constraint.
        const heightWithoutHorizontalScrollbar = verticalElement.clientHeight + scrollbarWidth;
        return verticalElement.scrollHeight <= heightWithoutHorizontalScrollbar;
    }

    return true;
}

function getHorizontalOverflow(el: HTMLElement): number {
    return el.scrollWidth - el.clientWidth;
}

function getVerticalOverflow(el: HTMLElement): number {
    return el.scrollHeight - el.clientHeight;
}

type ScrollbarCauseCheck = {
    candidateOverflow: number;
    candidateScrollSize: number;
    candidateClientSize: number;
    scrollbarWidth: number;
    oppositeOverflowing: boolean;
};

/**
 * Returns true when a scrollbar on one axis only exists because the opposite-axis scrollbar
 * reduced the available space (overflow is small and the opposite scrollbar is actually showing).
 */
function isScrollbarCausedByOppositeAxis({
    candidateOverflow,
    candidateScrollSize,
    candidateClientSize,
    scrollbarWidth,
    oppositeOverflowing,
}: ScrollbarCauseCheck): boolean {
    if (!oppositeOverflowing) {
        return false;
    }

    if (candidateOverflow <= 0 || candidateOverflow > scrollbarWidth) {
        return false;
    }

    const sizeWithoutOppositeScrollbar = candidateClientSize + scrollbarWidth;
    return candidateScrollSize > candidateClientSize && candidateScrollSize <= sizeWithoutOppositeScrollbar;
}
