let initialized = false;

// jsdom neither persists scrollTop/scrollLeft on assignment nor fires 'scroll' events.
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

    /** When true, `offset*`/`client*` dimensions come from `getBoundingClientRect()`. Default
     * `false` returns jsdom's 0, matching most captured snapshots; opt in for viewport-aware code
     * such as page-key navigation. */
    useRealOffsetDimensions: false,

    init,
    getBoundingClientRect,
};

const POPUP_OR_DIALOG_SELECTOR =
    '.ag-popup,.ag-dialog,.ag-advanced-filter-builder,.ag-tooltip,.ag-rich-select-list,.ag-menu';
const VIRTUAL_LIST_SELECTOR =
    '.ag-advanced-filter-builder-virtual-list-viewport,.ag-rich-select-virtual-list-viewport,.ag-advanced-filter-builder-list,.ag-advanced-filter-builder,.ag-rich-select,.ag-virtual-list-viewport';

function inPopupOrDialog(el: HTMLElement): boolean {
    return !!el.closest(POPUP_OR_DIALOG_SELECTOR);
}

function inVirtualList(el: HTMLElement): boolean {
    return !!el.closest(VIRTUAL_LIST_SELECTOR);
}

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
    if (classList.contains('ag-advanced-filter-header')) {
        return 'advanced-filter-header';
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
    if (classList.contains('ag-rich-select-row')) {
        return 'rich-select-row';
    }
    return 'default';
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

    // Keep getComputedStyle width/height consistent with getBoundingClientRect; jsdom's '0'
    // otherwise suppresses column virtualisation (viewportRight === 0).
    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function patchedGetComputedStyle(
        el: Element,
        pseudoElement?: string | null
    ): CSSStyleDeclaration {
        const style = origGetComputedStyle.call(window, el, pseudoElement);
        if (!pseudoElement && el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();
            // Only override when still at the jsdom default ('' or '0px').
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
            // jsdom returns '' for unset padding; browsers return '0px'. Code that does
            // `parseFloat(getComputedStyle(el).paddingTop)` (e.g. virtual-list drag hit-testing) then
            // gets NaN, so default the paddings to a numeric-parseable value like a real browser.
            for (const prop of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const) {
                if (style[prop] === '') {
                    Object.defineProperty(style, prop, { value: '0px', writable: true, configurable: true });
                }
            }
        }
        return style;
    };

    // jsdom defines these on HTMLElement.prototype (shadowing any Element.prototype patch) returning
    // 0. Install on HTMLElement.prototype, behind a flag so the default keeps jsdom's 0 (preserving
    // snapshots) and only opt-in tests see mocked dimensions.
    const installOffsetDimensionPatch = (prop: 'offsetHeight' | 'clientHeight' | 'offsetWidth' | 'clientWidth') => {
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
        const axis = prop === 'offsetWidth' || prop === 'clientWidth' ? 'width' : 'height';
        const isHeightProp = prop === 'offsetHeight' || prop === 'clientHeight';
        Object.defineProperty(HTMLElement.prototype, prop, {
            configurable: true,
            get(this: HTMLElement) {
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

    // scrollHeight must reflect the grid's virtual container height (style.height on a nested child),
    // so recurse into children to propagate the max upwards.
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

    // scrollWidth must reflect total columns width (style.width on the container); recurse for parity
    // with scrollHeight and resilience to structure changes.
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

    // jsdom fires no 'scroll' on programmatic scrollTop/scrollLeft, which drives grid virtualisation;
    // patch the setters to dispatch it. Values live in a WeakMap since jsdom resets them on read.
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
    // The grid sets innerText (used in snapshots) but jsdom lacks it; alias to textContent.
    if (!('innerText' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'innerText', {
            set(value) {
                this.textContent = value;
            },
        });
    }
}
