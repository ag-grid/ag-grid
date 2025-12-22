import { _shouldShowHorizontalScroll, _shouldShowVerticalScroll } from './scrollbarVisibilityHelper';

describe('scrollbarVisibilityHelper', () => {
    const scrollbarWidth = 16;

    test('vertical scrollbar caused by rows still allows horizontal scroll when width shrinks', () => {
        const { element: horizontal, setSizes: setHorizontal } = createElementWithSizes({
            clientWidth: 1000,
            // Start slightly narrower than the available width so that once the vertical scrollbar
            // appears the horizontal overflow is small (<= scrollbarWidth).
            scrollWidth: 995,
        });
        const { element: vertical, setSizes: setVertical } = createElementWithSizes({
            clientHeight: 400,
            scrollHeight: 400,
        });

        expect(_shouldShowHorizontalScroll(horizontal, vertical, scrollbarWidth)).toBe(false);

        // Vertical scrollbar appears and shrinks available width by the scrollbar size.
        setVertical({ scrollHeight: 800 });
        setHorizontal({ clientWidth: 1000 - scrollbarWidth });

        expect(_shouldShowVerticalScroll(vertical, horizontal, scrollbarWidth)).toBe(true);
        expect(_shouldShowHorizontalScroll(horizontal, vertical, scrollbarWidth)).toBe(true);
    });

    test('horizontal scrollbar caused by columns does not incorrectly trigger vertical scroll', () => {
        const { element: vertical, setSizes: setVertical } = createElementWithSizes({
            clientHeight: 500,
            scrollHeight: 500,
        });
        const { element: horizontal } = createElementWithSizes({
            clientWidth: 600,
            scrollWidth: 900,
        });

        expect(_shouldShowHorizontalScroll(horizontal, vertical, scrollbarWidth)).toBe(true);
        expect(_shouldShowVerticalScroll(vertical, horizontal, scrollbarWidth)).toBe(false);

        // Removing horizontal overflow should leave both scrollbars hidden.
        setVertical({ scrollHeight: 400 });
        expect(_shouldShowVerticalScroll(vertical, horizontal, scrollbarWidth)).toBe(false);
    });

    test('horizontal scrollbar is suppressed when it would only create its own vertical overflow', () => {
        const { element, setSizes } = createElementWithSizes({
            clientWidth: 500,
            scrollWidth: 516,
            clientHeight: 500,
            scrollHeight: 508,
        });

        // With a tiny overflow in both directions, the horizontal scrollbar would create
        // the vertical scrollbar on the same element, so we avoid rendering it.
        expect(_shouldShowHorizontalScroll(element, element, scrollbarWidth)).toBe(false);

        // Once the vertical overflow is genuine, we should show the horizontal scrollbar.
        setSizes({ scrollHeight: 600, scrollWidth: 515 });
        expect(_shouldShowHorizontalScroll(element, element, scrollbarWidth)).toBe(true);
    });
});

type ElementDimensions = {
    clientWidth?: number;
    scrollWidth?: number;
    clientHeight?: number;
    scrollHeight?: number;
};

function createElementWithSizes(initial: ElementDimensions) {
    const sizes: Required<ElementDimensions> = {
        clientWidth: 0,
        scrollWidth: 0,
        clientHeight: 0,
        scrollHeight: 0,
        ...initial,
    };

    const element = document.createElement('div');

    Object.defineProperties(element, {
        clientWidth: { get: () => sizes.clientWidth },
        scrollWidth: { get: () => sizes.scrollWidth },
        clientHeight: { get: () => sizes.clientHeight },
        scrollHeight: { get: () => sizes.scrollHeight },
    });

    return {
        element,
        setSizes(update: ElementDimensions) {
            Object.assign(sizes, update);
        },
    };
}
