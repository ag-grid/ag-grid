let initialized = false;

export const mockGridLayout = {
    /** Same as standard default rowHeight, --ag-row-height */
    rowHeight: 42,

    gridWidth: 1000,
    gridHeight: 800,
    headerHeight: 30,
    columnWidth: 150,
    dragHandleWidth: 20,

    init,
    getBoundingClientRect,
};

const getElementType = (el: HTMLElement) => {
    if (el === document.body) {
        return 'body';
    }
    const classList = el.classList;
    if (classList.contains('ag-row')) return 'row';
    if (classList.contains('ag-header')) return 'header';
    if (classList.contains('ag-body-viewport')) return 'viewport';
    if (classList.contains('ag-root')) return 'grid';
    if (classList.contains('ag-header-cell')) return 'column';
    if (classList.contains('ag-cell')) return 'cell';
    if (classList.contains('ag-drag-handle')) return 'drag-handle';
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
            top = rowIndex * rowHeight;
            height = rowHeight;
            break;
        }

        case 'drag-handle': {
            const cellRect =
                (this.closest('.ag-cell') ?? this.closest('.ag-row'))?.getBoundingClientRect() ??
                new DOMRect(0, 0, 75, mockGridLayout.rowHeight);

            return new DOMRect(cellRect.left, cellRect.top, mockGridLayout.dragHandleWidth, cellRect.height);
        }

        case 'cell': {
            const rowIndex = parseInt(this.getAttribute('row-index') || '0', 10);
            const colIndex = parseInt(this.getAttribute('col-index') || '0', 10);
            top = rowIndex * rowHeight;
            left = colIndex * columnWidth;
            width = columnWidth;
            height = rowHeight;
            break;
        }

        case 'body':
            width = gridWidth;
            height = gridHeight;
            break;

        case 'default': {
            width = 100;
            height = 20;
            break;
        }
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

    for (const prop of ['offsetHeight', 'scrollHeight', 'clientHeight']) {
        Object.defineProperty(Element.prototype, prop, {
            get(this: HTMLElement) {
                return this.getBoundingClientRect().height;
            },
        });
    }

    for (const prop of ['offsetWidth', 'scrollWidth', 'clientWidth']) {
        Object.defineProperty(Element.prototype, prop, {
            get(this: Element) {
                return this.getBoundingClientRect().width;
            },
        });
    }

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
