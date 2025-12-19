import { _getScrollbarWidth } from '../agStack/utils/browser';

const AXES = {
    horizontal: {
        overflow: (el: HTMLElement) => el.scrollWidth - el.clientWidth,
        scrollSize: (el: HTMLElement) => el.scrollWidth,
        clientSize: (el: HTMLElement) => el.clientWidth,
        opposite: 'vertical' as const,
    },
    vertical: {
        overflow: (el: HTMLElement) => el.scrollHeight - el.clientHeight,
        scrollSize: (el: HTMLElement) => el.scrollHeight,
        clientSize: (el: HTMLElement) => el.clientHeight,
        opposite: 'horizontal' as const,
    },
};

export function _shouldShowHorizontalScroll(
    horizontalElement: HTMLElement,
    verticalScrollElement?: HTMLElement,
    scrollbarWidth: number = _getScrollbarWidth() || 0
): boolean {
    return shouldShowScroll(horizontalElement, verticalScrollElement, 'horizontal', scrollbarWidth);
}

export function _shouldShowVerticalScroll(
    verticalElement: HTMLElement,
    horizontalScrollElement?: HTMLElement,
    scrollbarWidth: number = _getScrollbarWidth() || 0
): boolean {
    return shouldShowScroll(verticalElement, horizontalScrollElement, 'vertical', scrollbarWidth);
}

function shouldShowScroll(
    primaryElement: HTMLElement,
    oppositeElement: HTMLElement | undefined,
    axis: 'horizontal' | 'vertical',
    scrollbarWidth: number
): boolean {
    const primary = AXES[axis];
    const opposite = AXES[primary.opposite];

    const primaryOverflow = primary.overflow(primaryElement);
    if (primaryOverflow <= 0) {
        return false;
    }

    if (!oppositeElement || scrollbarWidth === 0) {
        return true;
    }

    const oppositeOverflow = opposite.overflow(oppositeElement);
    if (oppositeOverflow <= 0) {
        return true;
    }

    if (primaryOverflow <= scrollbarWidth) {
        const oppositeCausedByPrimary = isScrollbarCausedByOppositeAxis({
            candidateOverflow: oppositeOverflow,
            candidateScrollSize: opposite.scrollSize(oppositeElement),
            candidateClientSize: opposite.clientSize(oppositeElement),
            scrollbarWidth,
        });

        if (oppositeCausedByPrimary) {
            // The opposite scrollbar only exists because of this one, so suppress this scrollbar.
            return false;
        }

        // At this point the opposite scrollbar is real. Even if the content would fit without it,
        // the reduced space is a real constraint, so show this scrollbar.
        const sizeWithoutOppositeScrollbar = primary.clientSize(primaryElement) + scrollbarWidth;
        return primary.scrollSize(primaryElement) <= sizeWithoutOppositeScrollbar;
    }

    return true;
}

type ScrollbarCauseCheck = {
    candidateOverflow: number;
    candidateScrollSize: number;
    candidateClientSize: number;
    scrollbarWidth: number;
};

/**
 * Returns true when a scrollbar on one axis only exists because the opposite-axis scrollbar
 * reduced the available space (overflow is small and fits once the opposite bar is removed).
 */
function isScrollbarCausedByOppositeAxis({
    candidateOverflow,
    candidateScrollSize,
    candidateClientSize,
    scrollbarWidth,
}: ScrollbarCauseCheck): boolean {
    if (candidateOverflow <= 0 || candidateOverflow > scrollbarWidth) {
        return false;
    }

    const sizeWithoutOppositeScrollbar = candidateClientSize + scrollbarWidth;
    return candidateScrollSize > candidateClientSize && candidateScrollSize <= sizeWithoutOppositeScrollbar;
}
