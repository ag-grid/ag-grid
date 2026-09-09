/**
 * happy-dom gives virtual-list viewports 0 height, so filter/rich-select VirtualLists render 0 rows.
 * Wraps the active `getBoundingClientRect` to force a tall height so tests can query/click rows.
 * Install in `beforeAll`, uninstall in `afterAll`.
 */
import { VIRTUAL_LIST_VIEWPORT_CLASSES } from './virtualListViewports';

const DEFAULT_VIEWPORT_HEIGHT = 400;

/** The shared viewport list plus `.ag-autocomplete-list`, whose own rect is what its list measures. */
const TALL_VIEWPORT_SELECTORS = [...VIRTUAL_LIST_VIEWPORT_CLASSES, '.ag-autocomplete-list'] as const;

let saved: typeof Element.prototype.getBoundingClientRect | undefined;
/** The wrapper this module installed, so uninstall can tell it is still the active one. */
let installed: typeof Element.prototype.getBoundingClientRect | undefined;

function matchesTallViewport(el: Element): boolean {
    for (let i = 0, len = TALL_VIEWPORT_SELECTORS.length; i < len; ++i) {
        if (el.classList.contains(TALL_VIEWPORT_SELECTORS[i].slice(1))) {
            return true;
        }
    }
    return false;
}

/** Overrides viewport heights so filter/rich-select VirtualLists render rows without a layout engine. */
export function installFilterLayoutMock(height: number = DEFAULT_VIEWPORT_HEIGHT): void {
    if (saved) {
        return;
    }
    saved = Element.prototype.getBoundingClientRect;
    const previous = saved;
    installed = function (this: Element): DOMRect {
        const rect = previous.call(this);
        if (matchesTallViewport(this)) {
            return new DOMRect(rect.x, rect.y, rect.width || 200, height);
        }
        return rect;
    };
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        value: installed,
    });
}

export function uninstallFilterLayoutMock(): void {
    if (!saved) {
        return;
    }
    // Only if ours is still the active one: `mockGridLayout.init()` replaces this outright, and restoring
    // over it would hand the whole worker the native 0-height rect for the rest of the file.
    if (Element.prototype.getBoundingClientRect === installed) {
        Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
            configurable: true,
            writable: true,
            value: saved,
        });
    }
    saved = undefined;
    installed = undefined;
}
