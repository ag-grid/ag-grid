/** Determines which row container an element belongs to. */
export function getRowContainerType(el: HTMLElement): string {
    const containerSelectors: [string, string][] = [
        ['.ag-grid-scrolling-rows', 'center'],
        ['.ag-grid-pinned-top-rows-container', 'pinned-top'],
        ['.ag-grid-pinned-bottom-rows-container', 'pinned-bottom'],
        ['.ag-grid-sticky-top-rows-container', 'pinned-top'],
        ['.ag-grid-sticky-bottom-rows-container', 'pinned-bottom'],
    ];
    for (const [selector, name] of containerSelectors) {
        if (el.closest(selector)) {
            return name;
        }
    }
    return 'unknown';
}

/**
 * Returns true if the element is inside a nested grid (e.g. a detail grid inside master-detail). `gridElement`
 * is the grid's outermost OWNED element, which sits above its own `.ag-root-wrapper`, so "a wrapper anywhere
 * between the two" matches everything: nested means the nearest wrapper is not this grid's.
 */
export function isInNestedGrid(el: HTMLElement, gridElement: HTMLElement): boolean {
    const ownWrapper = gridElement.classList.contains('ag-root-wrapper')
        ? gridElement
        : gridElement.querySelector('.ag-root-wrapper');
    const nearestWrapper = el.closest('.ag-root-wrapper');
    return !!nearestWrapper && nearestWrapper !== ownWrapper;
}
