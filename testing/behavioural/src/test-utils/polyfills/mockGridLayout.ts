let initialized = false;

// Stores per-element scroll positions, since jsdom does not persist scrollTop/scrollLeft
// when those properties are set, and does not fire 'scroll' events on assignment.
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

    /**
     * Opt-in: when true, `offsetHeight`/`clientHeight`/`offsetWidth`/`clientWidth` return the
     * mocked dimensions from `getBoundingClientRect()`. Default `false` preserves jsdom's
     * built-in behaviour of returning 0, which matches what most behavioural-test snapshots
     * were captured against. Set this in `beforeAll` (and restore in `afterAll`) for tests
     * that depend on viewport-aware production code such as page-key navigation.
     */
    useRealOffsetDimensions: false,

    init,
    getBoundingClientRect,
};

const getElementType = (el: HTMLElement) => {
    if (el === document.body) {
        return 'body';
    }
    const classList = el.classList;
    if (classList.contains('ag-grid-scrollable-area')) {
        return 'scrollable-area';
    }
    if (classList.contains('ag-grid-scrolling-rows')) {
        return 'scrolling-rows';
    }
    if (classList.contains('ag-header-row')) {
        return 'header-row';
    }
    if (classList.contains('ag-row')) {
        return 'row';
    }
    if (classList.contains('ag-header')) {
        return 'header';
    }
    if (classList.contains('ag-grid-viewport')) {
        return 'viewport';
    }
    if (classList.contains('ag-root')) {
        return 'grid';
    }
    if (classList.contains('ag-header-cell')) {
        return 'column';
    }
    if (classList.contains('ag-cell')) {
        return 'cell';
    }
    if (classList.contains('ag-drag-handle')) {
        return 'drag-handle';
    }
    return 'default';
};

function getBoundingClientRect(this: HTMLElement): DOMRect {
    const { gridWidth, gridHeight, rowHeight, headerHeight, columnWidth } = mockGridLayout;

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
            const rowIndex = parseInt(this.getAttribute('row-index') || '0', 10);
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
            const rowIndex = parseInt(this.getAttribute('row-index') || '0', 10);
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

        case 'body':
            width = gridWidth;
            height = gridHeight;
            break;

        case 'default': {
            // For position:fixed elements (auto-width measurement containers),
            // return 0 so auto-sizing falls back to minWidth. Otherwise, return a default.
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

    // If the element has an explicit style.width or style.height set by the grid,
    // use those values instead of the mock defaults. This ensures that auto-sizing
    // code reads the actual column/row dimensions rather than generic mock values.
    const styleWidth = parseFloat(this.style?.width);
    if (!isNaN(styleWidth) && styleWidth > 0) {
        width = styleWidth;
    }

    const styleHeight = parseFloat(this.style?.height);
    if (!isNaN(styleHeight) && styleHeight > 0) {
        height = styleHeight;
    }

    const offsetParent = this.offsetParent ?? this.parentElement;
    if (offsetParent !== this && offsetParent?.getBoundingClientRect) {
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

    DOMRect.prototype[Symbol.for('nodejs.util.inspect.custom')] = function inspect(this: DOMRect) {
        return new DOMRectInspect(this.x, this.y, this.width, this.height);
    };

    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        value: getBoundingClientRect,
    });

    // Patch window.getComputedStyle so that _getElementSize / _getInnerWidth return values
    // consistent with getBoundingClientRect. Without this, getComputedStyle returns '0' for
    // width/height in jsdom, which causes column virtualisation to be suppressed (viewportRight === 0).
    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function patchedGetComputedStyle(
        el: Element,
        pseudoElement?: string | null
    ): CSSStyleDeclaration {
        const style = origGetComputedStyle.call(window, el, pseudoElement);
        if (!pseudoElement && el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();
            // Only override width/height if they are still the jsdom default of '' or '0px'
            const origWidth = style.width;
            const origHeight = style.height;
            if (rect.width > 0 && (!origWidth || origWidth === '' || origWidth === '0px' || origWidth === '0')) {
                Object.defineProperty(style, 'width', {
                    value: `${rect.width}px`,
                    writable: true,
                    configurable: true,
                });
            }
            if (rect.height > 0 && (!origHeight || origHeight === '' || origHeight === '0px' || origHeight === '0')) {
                Object.defineProperty(style, 'height', {
                    value: `${rect.height}px`,
                    writable: true,
                    configurable: true,
                });
            }
        }
        return style;
    };

    // jsdom defines offsetHeight/clientHeight/offsetWidth/clientWidth on HTMLElement.prototype
    // (more specific than Element.prototype) and returns 0. A patch on Element.prototype is
    // therefore shadowed. We install on HTMLElement.prototype directly, behind a feature flag
    // so the default behaviour matches jsdom (returns 0) — preserving existing snapshots —
    // and only opt-in tests see real mocked dimensions.
    const installOffsetDimensionPatch = (prop: 'offsetHeight' | 'clientHeight' | 'offsetWidth' | 'clientWidth') => {
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
        const axis = prop === 'offsetWidth' || prop === 'clientWidth' ? 'width' : 'height';
        Object.defineProperty(HTMLElement.prototype, prop, {
            configurable: true,
            get(this: HTMLElement) {
                if (mockGridLayout.useRealOffsetDimensions) {
                    return this.getBoundingClientRect()[axis];
                }
                return original?.get?.call(this) ?? 0;
            },
        });
    };
    for (const prop of ['offsetHeight', 'clientHeight', 'offsetWidth', 'clientWidth'] as const) {
        installOffsetDimensionPatch(prop);
    }

    // scrollHeight must account for the virtual scroll container height set by the grid (e.g.
    // ag-center-cols-container gets style.height = rowCount * rowHeight). This is nested 2 levels
    // below the scroll root (ag-body-viewport → ag-center-cols-clipper → ag-center-cols-viewport),
    // so we recurse into children's scrollHeight to propagate the value upwards.
    Object.defineProperty(Element.prototype, 'scrollHeight', {
        get(this: HTMLElement) {
            let max = this.getBoundingClientRect().height;
            const styleH = parseFloat(this.style?.height);
            if (!isNaN(styleH) && styleH > max) {
                max = styleH;
            }
            for (let i = 0; i < this.children.length; i++) {
                const childH = (this.children[i] as HTMLElement).scrollHeight;
                if (childH > max) {
                    max = childH;
                }
            }
            return max;
        },
    });

    // scrollWidth must account for the total columns width (style.width on ag-center-cols-container).
    // ag-center-cols-container is a direct child of ag-center-cols-viewport, so one level suffices,
    // but we recurse for consistency in case the structure changes.
    Object.defineProperty(Element.prototype, 'scrollWidth', {
        get(this: HTMLElement) {
            let max = this.getBoundingClientRect().width;
            const styleW = parseFloat(this.style?.width);
            if (!isNaN(styleW) && styleW > max) {
                max = styleW;
            }
            for (let i = 0; i < this.children.length; i++) {
                const childW = (this.children[i] as HTMLElement).scrollWidth;
                if (childW > max) {
                    max = childW;
                }
            }
            return max;
        },
    });

    // jsdom does not fire 'scroll' events when scrollTop/scrollLeft are set programmatically.
    // The grid's virtualisation is driven by these scroll events, so we patch the setters to
    // dispatch them. Values are stored in a WeakMap since jsdom resets them on read.
    Object.defineProperty(Element.prototype, 'scrollTop', {
        get(this: Element) {
            return getScrollPos(this).top;
        },
        set(this: Element, value: number) {
            const pos = getScrollPos(this);
            const clamped = Math.max(0, value);
            if (pos.top !== clamped) {
                pos.top = clamped;
                this.dispatchEvent(new Event('scroll'));
            }
        },
        configurable: true,
    });

    Object.defineProperty(Element.prototype, 'scrollLeft', {
        get(this: Element) {
            return getScrollPos(this).left;
        },
        set(this: Element, value: number) {
            const pos = getScrollPos(this);
            const clamped = Math.max(0, value);
            if (pos.left !== clamped) {
                pos.left = clamped;
                this.dispatchEvent(new Event('scroll'));
            }
        },
        configurable: true,
    });

    Object.defineProperty(Element.prototype, 'offsetTop', {
        get(this: Element) {
            return this.getBoundingClientRect().top;
        },
    });

    Object.defineProperty(Element.prototype, 'offsetLeft', {
        get(this: Element) {
            return this.getBoundingClientRect().left;
        },
    });

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
    // for snapshots, the grid uses innerText which is not supported by JSDOM; so we need to polyfill it
    // with innerText instead
    if (!('innerText' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'innerText', {
            set(value) {
                this.textContent = value;
            },
        });
    }
}
