// A deterministic fake layout for the test DOM, installed once per worker onto the Element/HTMLElement
// prototypes: happy-dom computes none, so every rect, offset and scroll dimension the grid measures would
// read 0, virtualisation would render nothing and popups would have nowhere to go.
import { VIRTUAL_LIST_VIEWPORT_CLASSES } from './virtualListViewports';

let initialized = false;

/** Backing store for the patched scrollTop/scrollLeft below, which shadow happy-dom's own. */
const scrollPositions = new WeakMap<Element, { top: number; left: number }>();

function getScrollPos(el: Element): { top: number; left: number } {
    let pos = scrollPositions.get(el);
    if (!pos) {
        pos = { top: 0, left: 0 };
        scrollPositions.set(el, pos);
    }
    return pos;
}

export const mockGridLayout = {
    /** Same as standard default rowHeight, --ag-row-height */
    rowHeight: 42,

    gridWidth: 1000,
    gridHeight: 800,
    headerHeight: 30,
    columnWidth: 150,
    dragHandleWidth: 20,

    /** Must match the widget's `LIST_ITEM_HEIGHT` default: the virtual list hit-tests clicks by
     * clientY, so a mismatch drifts row selection past the first couple of rows. */
    listItemHeight: 24,

    /** Source `offset*`/`client*` from `getBoundingClientRect()`. Off by default so snapshots keep the
     * implementation's 0; opt in for viewport-aware code such as page-key navigation. */
    useRealOffsetDimensions: false,

    /** Per-element measured height, for cases like wrapped text driving an autoHeight wrapper taller;
     * undefined falls back to the standard mock. Needs `useRealOffsetDimensions` to reach `offsetHeight`. */
    elementHeightOverride: undefined as ((el: HTMLElement) => number | undefined) | undefined,

    init,
    resetOptions,
};

/** Restored by `resetOptions`. Only isolation keeps a suite that threw before its `afterAll` from
 * handing its grid size to whatever runs next in the same worker. */
const DEFAULT_OPTIONS = { ...mockGridLayout };

function resetOptions(): void {
    Object.assign(mockGridLayout, DEFAULT_OPTIONS);
}

/** The computed-style properties {@link init}'s `getComputedStyle` wrapper may write, and must undo first. */
const OVERRIDDEN_STYLE_PROPS = ['width', 'height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];

const POPUP_OR_DIALOG_SELECTOR =
    '.ag-popup,.ag-dialog,.ag-advanced-filter-builder,.ag-tooltip,.ag-rich-select-list,.ag-menu';
// `.ag-rich-select` on top of the shared list: here the match is by `closest`, so the picker's own wrapper counts.
const VIRTUAL_LIST_SELECTOR = [...VIRTUAL_LIST_VIEWPORT_CLASSES, '.ag-rich-select'].join(',');

function inPopupOrDialog(el: HTMLElement): boolean {
    return !!el.closest(POPUP_OR_DIALOG_SELECTOR);
}

function inVirtualList(el: HTMLElement): boolean {
    return !!el.closest(VIRTUAL_LIST_SELECTOR);
}

/**
 * The grid's scrollbar probe. Answered with 0 it reads as "the DOM isn't ready", so nothing is cached and
 * a fresh div is built and measured on every call, which is what makes startup slow.
 */
function isScrollbarProbe(el: HTMLElement): boolean {
    // `msOverflowStyle` first: happy-dom doesn't know the property, so the grid's assignment leaves a
    // plain own property and this is a bare lookup, undefined for everything else.
    const style = el.style as CSSStyleDeclaration & { msOverflowStyle?: string };
    return style.msOverflowStyle === 'scrollbar' && style.overflow === 'scroll' && style.position === 'absolute';
}

// Precedence order: lowest matching rank wins. One lookup per class the element has, rather than a
// `contains` per class the mock knows about, on the hottest path in this file.
const ELEMENT_TYPES = [
    'scrollable-area',
    'scrolling-rows',
    'header-row',
    'advanced-filter-header',
    'row',
    'header',
    'viewport',
    'grid',
    'column',
    'cell',
    'drag-handle',
    'rich-select-row',
] as const;
const ELEMENT_TYPE_RANK = new Map<string, number>([
    ['ag-grid-scrollable-area', 0],
    ['ag-grid-scrolling-rows', 1],
    ['ag-header-row', 2],
    ['ag-advanced-filter-header', 3],
    ['ag-row', 4],
    ['ag-header', 5],
    ['ag-grid-viewport', 6],
    ['ag-root', 7],
    ['ag-header-cell', 8],
    ['ag-cell', 9],
    ['ag-drag-handle', 10],
    ['ag-rich-select-row', 11],
]);

const getElementType = (el: HTMLElement): (typeof ELEMENT_TYPES)[number] | 'body' | 'default' => {
    if (el === document.body) {
        return 'body';
    }
    const classList = el.classList;
    let best = -1;
    for (let i = 0, len = classList.length; i < len; i++) {
        const rank = ELEMENT_TYPE_RANK.get(classList[i]!);
        if (rank !== undefined && (best === -1 || rank < best)) {
            best = rank;
        }
    }
    return best === -1 ? 'default' : ELEMENT_TYPES[best];
};

/** Pinned rows carry a prefixed `row-index` (`t-0`/`b-0`), so the model index is the trailing number and
 *  `parseInt` of the whole value is NaN - which spreads into the row's rect and every cell rect under it.
 *  Kept local rather than shared with the row helpers: this module patches the prototypes before any grid
 *  module loads, so it pulls in no grid code. */
const parseRowIndexAttr = (el: HTMLElement): number => {
    const index = Number(el.getAttribute('row-index')?.replace(/^\D+/, ''));
    return Number.isFinite(index) ? index : 0;
};

function getBoundingClientRect(this: HTMLElement): DOMRect {
    const { gridWidth, gridHeight, rowHeight, headerHeight, columnWidth, listItemHeight } = mockGridLayout;

    const type = getElementType(this);

    let width = gridWidth;
    let height = 20;
    let top = 0;
    let left = 0;

    switch (type) {
        case 'scrollable-area': {
            height = gridHeight;
            break;
        }
        case 'scrolling-rows': {
            height = gridHeight;
            break;
        }
        case 'header': {
            height = headerHeight;
            break;
        }
        case 'viewport': {
            top = headerHeight;
            height = gridHeight - headerHeight;
            break;
        }
        case 'advanced-filter-header': {
            top = headerHeight;
            height = headerHeight;
            break;
        }
        case 'grid': {
            height = gridHeight;
            break;
        }
        case 'column': {
            width = columnWidth;
            height = headerHeight;
            break;
        }

        case 'row': {
            const rowIndex = parseRowIndexAttr(this);
            const paginationOffset = getPaginationOffset(this);
            const adjustedRowIndex = rowIndex - paginationOffset;
            top = adjustedRowIndex * rowHeight;
            height = rowHeight;
            break;
        }
        case 'header-row': {
            height = headerHeight;
            break;
        }

        case 'cell': {
            const rowIndex = parseRowIndexAttr(this);
            const colIndex = parseInt(this.getAttribute('col-index') || '0', 10);
            const paginationOffset = getPaginationOffset(this);
            const adjustedRowIndex = rowIndex - paginationOffset;

            top = adjustedRowIndex * rowHeight;
            left = colIndex * columnWidth;
            width = columnWidth;
            height = rowHeight;
            break;
        }

        case 'drag-handle': {
            const cellRect =
                (this.closest('.ag-cell') ?? this.closest('.ag-row'))?.getBoundingClientRect() ??
                new DOMRect(0, 0, 75, mockGridLayout.rowHeight);

            return new DOMRect(cellRect.left, cellRect.top, mockGridLayout.dragHandleWidth, cellRect.height);
        }

        case 'rich-select-row': {
            height = listItemHeight;
            break;
        }

        case 'body':
            width = gridWidth;
            height = gridHeight;
            break;

        case 'default': {
            // position:fixed = auto-width measurement container; return 0 so auto-sizing falls back to minWidth.
            if (this.style?.position === 'fixed') {
                width = 0;
                height = 0;
            } else {
                width = 100;
                height = 20;
            }
            break;
        }
    }

    // Prefer explicit grid-set style dimensions so auto-sizing reads real column/row sizes.
    const styleWidth = parseFloat(this.style?.width);
    if (!isNaN(styleWidth) && styleWidth > 0) {
        width = styleWidth;
    }

    const styleHeight = parseFloat(this.style?.height);
    if (!isNaN(styleHeight) && styleHeight > 0) {
        height = styleHeight;
    }

    const overrideHeight = mockGridLayout.elementHeightOverride?.(this);
    if (overrideHeight != null) {
        height = overrideHeight;
    }

    // The parent, not `offsetParent ?? parentElement`: nothing here reports a real offsetParent, so that
    // fallback resolved to the parent every time anyway, at the cost of a `closest()` per rect.
    const offsetParent = this.parentElement;
    if (offsetParent) {
        const parentRect = offsetParent.getBoundingClientRect();
        top += parentRect.top || 0;
        left += parentRect.left || 0;
    }

    return new DOMRect(left, top, width, height);
}

function init(): boolean {
    if (initialized) {
        return false;
    }
    initialized = true;
    innerTextPolyfill();

    const DOMRectInspect = class DOMRect {
        constructor(
            public x: number,
            public y: number,
            public width: number,
            public height: number
        ) {}
    };

    Object.defineProperty(DOMRect.prototype, Symbol.for('nodejs.util.inspect.custom'), {
        configurable: true,
        writable: true,
        value: function inspect(this: DOMRect) {
            return new DOMRectInspect(this.x, this.y, this.width, this.height);
        },
    });

    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        value: getBoundingClientRect,
    });

    // happy-dom's getComputedStyle is cheap; the per-call work below is not. 89% of the suite's calls
    // repeat on the same element inside one synchronous turn, so hand back the same declaration until
    // the next microtask, keyed on everything that could change the answer (no author stylesheets are
    // in play: the theme is injected as strings and nothing processes CSS).
    let styleTurn = 0;
    let styleTurnScheduled = false;
    const styleCache = new WeakMap<Element, { turn: number; key: string; style: CSSStyleDeclaration }>();
    // A cached width is only as fresh as the rect it came from, so the key spans the mock's dimensions too:
    // a test that resizes the grid mid-turn and re-measures must not be handed the old one. Two things it
    // cannot see, both needing a DOM change inside one synchronous turn: an ancestor's rect (which the
    // element's own rect sums), and a swap of `elementHeightOverride` for a different function.
    const styleKey = (el: Element): string => {
        const { gridWidth, gridHeight, rowHeight, headerHeight, columnWidth, listItemHeight } = mockGridLayout;
        const own = `${el.getAttribute('style') ?? ''}|${el.getAttribute('class') ?? ''}`;
        const rect = `${el.getAttribute('row-index') ?? ''}|${el.getAttribute('col-index') ?? ''}`;
        const layout = `${gridWidth},${gridHeight},${rowHeight},${headerHeight},${columnWidth},${listItemHeight}`;
        return `${own}|${rect}|${layout}|${mockGridLayout.useRealOffsetDimensions}|${mockGridLayout.elementHeightOverride !== undefined}`;
    };

    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function patchedGetComputedStyle(
        el: Element,
        pseudoElement?: string | null
    ): CSSStyleDeclaration {
        if (!styleTurnScheduled) {
            styleTurnScheduled = true;
            queueMicrotask(() => {
                styleTurn++;
                styleTurnScheduled = false;
            });
        }
        const cacheable = !pseudoElement && el instanceof HTMLElement;
        const key = cacheable ? styleKey(el) : '';
        if (cacheable) {
            const hit = styleCache.get(el);
            if (hit !== undefined && hit.turn === styleTurn && hit.key === key) {
                return hit.style;
            }
        }
        const style = origGetComputedStyle.call(window, el, pseudoElement);
        if (cacheable) {
            styleCache.set(el, { turn: styleTurn, key, style });
        }
        if (cacheable) {
            // happy-dom hands back one live declaration per element for that element's lifetime, so
            // last round's overrides must go first or they read as the implementation's own and pin the
            // size forever. `delete` restores the prototype accessor; none are own properties natively.
            for (const prop of OVERRIDDEN_STYLE_PROPS) {
                delete (style as unknown as Record<string, unknown>)[prop];
            }
            const rect = el.getBoundingClientRect();
            // Keep width/height consistent with getBoundingClientRect, but only where the DOM has no
            // answer of its own: a computed 0 otherwise suppresses column virtualisation (viewportRight === 0).
            const origWidth = style.width;
            const origHeight = style.height;
            if (rect.width > 0 && (!origWidth || origWidth === '0px' || origWidth === '0')) {
                Object.defineProperty(style, 'width', {
                    value: `${rect.width}px`,
                    writable: true,
                    configurable: true,
                });
            }
            if (rect.height > 0 && (!origHeight || origHeight === '0px' || origHeight === '0')) {
                Object.defineProperty(style, 'height', {
                    value: `${rect.height}px`,
                    writable: true,
                    configurable: true,
                });
            }
            // Unset padding computes to '' without layout where a browser says '0px', and callers that
            // `parseFloat` it (virtual-list drag hit-testing) would get NaN.
            for (const prop of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const) {
                if (style[prop] === '') {
                    Object.defineProperty(style, prop, { value: '0px', writable: true, configurable: true });
                }
            }
        }
        return style;
    };

    // These live on HTMLElement.prototype, shadowing any Element.prototype patch, so install there too.
    // Behind the flag, since the default 0 is what the captured snapshots record.
    const installOffsetDimensionPatch = (prop: 'offsetHeight' | 'clientHeight' | 'offsetWidth' | 'clientWidth') => {
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
        const axis = prop === 'offsetWidth' || prop === 'clientWidth' ? 'width' : 'height';
        const isHeightProp = prop === 'offsetHeight' || prop === 'clientHeight';
        Object.defineProperty(HTMLElement.prototype, prop, {
            configurable: true,
            get(this: HTMLElement) {
                // Ahead of the mode checks: every suite measures the probe, not only those opting into
                // real dimensions, and a rect of 0 would leave it inconclusive for both.
                if (isScrollbarProbe(this)) {
                    return Number.parseFloat(this.style[axis]) || 0;
                }
                if (mockGridLayout.useRealOffsetDimensions) {
                    return this.getBoundingClientRect()[axis];
                }
                if (isHeightProp && inVirtualList(this)) {
                    return this.getBoundingClientRect()[axis];
                }
                return original?.get?.call(this) ?? 0;
            },
        });
    };
    for (const prop of ['offsetHeight', 'clientHeight', 'offsetWidth', 'clientWidth'] as const) {
        installOffsetDimensionPatch(prop);
    }

    const origOffsetParentDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            const native = origOffsetParentDesc?.get?.call(this);
            if (native != null) {
                return native;
            }
            if (inPopupOrDialog(this)) {
                return this.parentElement;
            }
            return null;
        },
    });

    // scrollHeight/scrollWidth must reflect the grid's virtual container size, which lives as a style on a
    // nested child, so recurse to propagate the max upwards. One installer per axis: the two bodies differed
    // only in `height`/`width`, which is how a fix reaches one and silently misses the other.
    const installScrollSizePatch = (prop: 'scrollHeight' | 'scrollWidth', axis: 'height' | 'width') => {
        Object.defineProperty(Element.prototype, prop, {
            configurable: true,
            get(this: HTMLElement) {
                let max = this.getBoundingClientRect()[axis];
                const styleValue = parseFloat(this.style?.[axis]);
                if (!isNaN(styleValue) && styleValue > max) {
                    max = styleValue;
                }
                const children = this.children;
                for (let i = 0, len = children.length; i < len; ++i) {
                    const childMax = (children[i] as HTMLElement)[prop];
                    if (childMax > max) {
                        max = childMax;
                    }
                }
                return max;
            },
        });
    };
    installScrollSizePatch('scrollHeight', 'height');
    installScrollSizePatch('scrollWidth', 'width');

    // No 'scroll' is fired on programmatic scrollTop/scrollLeft, which drives grid virtualisation;
    // patch the setters to dispatch it. Values live in a WeakMap since the patched accessor owns them.
    const installScrollPositionPatch = (prop: 'scrollTop' | 'scrollLeft', edge: 'top' | 'left') => {
        Object.defineProperty(Element.prototype, prop, {
            configurable: true,
            get(this: Element) {
                return getScrollPos(this)[edge];
            },
            set(this: Element, value: number) {
                const pos = getScrollPos(this);
                const clamped = Math.max(0, value);
                if (pos[edge] !== clamped) {
                    pos[edge] = clamped;
                    this.dispatchEvent(new Event('scroll'));
                }
            },
        });
    };
    installScrollPositionPatch('scrollTop', 'top');
    installScrollPositionPatch('scrollLeft', 'left');

    // Absolute, not offsetParent-relative: nothing here reports a real offsetParent, and the consumers that
    // subtract a scroll offset get a consistent frame either way.
    const installOffsetPositionPatch = (prop: 'offsetTop' | 'offsetLeft', edge: 'top' | 'left') => {
        Object.defineProperty(Element.prototype, prop, {
            configurable: true,
            get(this: Element) {
                return this.getBoundingClientRect()[edge];
            },
        });
    };
    installOffsetPositionPatch('offsetTop', 'top');
    installOffsetPositionPatch('offsetLeft', 'left');

    return true;
}

function getPaginationOffset(el: HTMLElement): number {
    const body = el.closest('.ag-grid-scrolling-rows');
    if (!body) {
        return 0;
    }

    const rows = body.querySelectorAll('.ag-row:not(.ag-header-row)');
    let minIndex = Infinity;

    for (let i = 0; i < rows.length; i++) {
        const rowIndexAttr = rows[i].getAttribute('row-index');
        if (rowIndexAttr) {
            const idx = parseInt(rowIndexAttr, 10);
            minIndex = idx < minIndex ? idx : minIndex;
        }
    }

    return isFinite(minIndex) ? minIndex : 0;
}

export function innerTextPolyfill() {
    // Without layout there is no rendered text, so alias innerText to textContent. Overriding happy-dom's
    // own (on HTMLElement.prototype) also drops its throw on a null assignment and its per-descendant
    // getComputedStyle.
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
        configurable: true,
        get(this: Element) {
            return this.textContent;
        },
        set(this: Element, value: unknown) {
            this.textContent = value as string;
        },
    });
}
