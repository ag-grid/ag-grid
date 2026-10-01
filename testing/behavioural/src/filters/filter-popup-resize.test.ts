import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';

describe('column filter popup resize', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    interface ResizeCase {
        /** Viewport left of the grid, which is the popup parent. The grid is 700px wide. */
        gridLeft: number;
        /** How far into the grid the popup's left edge sits. */
        popupX: number;
        popupWidth: number;
        enableRtl: boolean;
        /** Horizontal drag distance applied to the resizer. */
        dx: number;
        /** Resizer to drag; defaults to the horizontal edge for the direction. */
        side?: 'bottomRight';
    }

    const GRID_WIDTH = 700;

    /** Opens the filter, drags its horizontal resizer by `dx` and returns the popup's inline width. */
    const resizeFilterPopup = async ({ gridLeft, popupX, popupWidth, enableRtl, dx, side }: ResizeCase) => {
        // Mimics theme CSS happy-dom lacks: `.ag-menu` is the positioned popup; min-width would be NaN.
        const originalGetComputedStyle = window.getComputedStyle;
        vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
            const style = originalGetComputedStyle(el, pseudo);
            if (!el.closest('.ag-menu')) {
                return style;
            }
            const overrides: Record<string, string> = el.classList.contains('ag-menu')
                ? { position: 'absolute', minWidth: '180px' }
                : { position: 'static' };
            return new Proxy(style, {
                get: (target, prop) => {
                    if (typeof prop === 'string' && prop in overrides) {
                        return overrides[prop];
                    }
                    const value = Reflect.get(target, prop);
                    return typeof value === 'function' ? value.bind(target) : value;
                },
            });
        });

        const api = gridsManager.createGrid('filterResize', {
            columnDefs: [{ field: 'make', filter: true }],
            rowData: [{ make: 'Toyota' }],
            enableRtl,
        });
        api.showColumnFilter('make');
        await asyncSetTimeout(0);

        const root = TestGridsManager.getHTMLElement(api)!;
        const popupParent = root.querySelector<HTMLElement>('.ag-root-wrapper') ?? root;
        const filterEl = root.ownerDocument.querySelector<HTMLElement>('.ag-filter-body-wrapper')!;
        const menuEl = filterEl.closest<HTMLElement>('.ag-menu')!;
        menuEl.style.left = `${popupX}px`;
        const resizer = filterEl.querySelector<HTMLElement>(`.ag-resizer-${side ?? (enableRtl ? 'left' : 'right')}`)!;
        expect(resizer).not.toBeNull();

        const currentWidth = () => Number.parseFloat(filterEl.style.width) || popupWidth;
        const popupLeft = gridLeft + popupX;
        const rect = (left: number, width: number) =>
            ({ left, right: left + width, top: 0, bottom: 300, width, height: 300, x: left, y: 0 }) as DOMRect;
        const originalRect = Element.prototype.getBoundingClientRect;
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
            if (this === popupParent) {
                return rect(gridLeft, GRID_WIDTH);
            }
            if (this === filterEl || this === menuEl) {
                return rect(popupLeft, currentWidth());
            }
            return originalRect.call(this);
        });
        Object.defineProperty(popupParent, 'clientWidth', { configurable: true, get: () => GRID_WIDTH });
        Object.defineProperty(filterEl, 'offsetWidth', { configurable: true, get: currentWidth });
        Object.defineProperty(menuEl, 'offsetWidth', { configurable: true, get: currentWidth });

        const startX = enableRtl ? popupLeft : popupLeft + popupWidth;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(resizer, startX, 100);
        await dispatcher.movePointer(resizer, startX + dx, 100);
        await dispatcher.finishDrag();

        return filterEl.style.width;
    };

    test.each<[string, ResizeCase, string]>([
        [
            'widens when the grid is not offset',
            { gridLeft: 0, popupX: 300, popupWidth: 200, enableRtl: false, dx: 50 },
            '250px',
        ],
        [
            'widens when the grid is offset far enough that the old cap went negative',
            { gridLeft: 416, popupX: 300, popupWidth: 200, enableRtl: false, dx: 50 },
            '250px',
        ],
        [
            'widens to the full space available when the grid is offset by less than the popup width',
            { gridLeft: 100, popupX: 300, popupWidth: 200, enableRtl: false, dx: 150 },
            '350px',
        ],
        [
            'widens from the bottom-right corner when the grid is offset',
            { gridLeft: 416, popupX: 300, popupWidth: 200, enableRtl: false, dx: 50, side: 'bottomRight' },
            '250px',
        ],
        [
            'widens from the left edge in RTL when the grid is offset',
            { gridLeft: 416, popupX: 300, popupWidth: 200, enableRtl: true, dx: -50 },
            '250px',
        ],
        [
            'shrinks from the left edge in RTL when the grid is offset',
            { gridLeft: 416, popupX: 300, popupWidth: 300, enableRtl: true, dx: 50 },
            '250px',
        ],
    ])('%s', async (_name, resizeCase, expectedWidth) => {
        expect(await resizeFilterPopup(resizeCase)).toBe(expectedWidth);
    });
});
