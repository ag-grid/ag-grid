/**
 * jsdom gives virtual-list viewports 0 height, so filter/rich-select VirtualLists render 0 rows.
 * Wraps the active `getBoundingClientRect` to force a tall height so tests can query/click rows.
 * Install in `beforeAll`, uninstall in `afterAll`.
 */

const DEFAULT_VIEWPORT_HEIGHT = 400;

/** Viewport elements whose height must be forced so their VirtualList renders rows. */
const TALL_VIEWPORT_SELECTORS = [
    '.ag-advanced-filter-builder-virtual-list-viewport',
    '.ag-advanced-filter-builder-list',
    // The builder root is the drag drop-target container; it needs a tall rect so the drag hover
    // hit-test (clientY within the container, row = clientY / rowHeight) can reach every row.
    '.ag-advanced-filter-builder',
    '.ag-rich-select-virtual-list-viewport',
    '.ag-virtual-list-viewport',
    '.ag-autocomplete-list',
] as const;

let saved: typeof Element.prototype.getBoundingClientRect | undefined;

function matchesTallViewport(el: Element): boolean {
    for (let i = 0, len = TALL_VIEWPORT_SELECTORS.length; i < len; ++i) {
        if (el.classList.contains(TALL_VIEWPORT_SELECTORS[i].slice(1))) {
            return true;
        }
    }
    return false;
}

/** Overrides viewport heights so filter/rich-select VirtualLists render rows in jsdom. */
export function installFilterLayoutMock(height: number = DEFAULT_VIEWPORT_HEIGHT): void {
    if (saved) {
        return;
    }
    saved = Element.prototype.getBoundingClientRect;
    const previous = saved;
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        value: function (this: Element): DOMRect {
            const rect = previous.call(this);
            if (matchesTallViewport(this)) {
                return new DOMRect(rect.x, rect.y, rect.width || 200, height);
            }
            return rect;
        },
    });
}

export function uninstallFilterLayoutMock(): void {
    if (saved) {
        Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
            configurable: true,
            writable: true,
            value: saved,
        });
        saved = undefined;
    }
}
