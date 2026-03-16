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

/** Returns true if the element is inside a nested grid (e.g. a detail grid inside master-detail). */
export function isInNestedGrid(el: HTMLElement, gridElement: HTMLElement): boolean {
    let parent = el.parentElement;
    while (parent && parent !== gridElement) {
        if (parent.classList.contains('ag-root-wrapper')) {
            return true;
        }
        parent = parent.parentElement;
    }
    return false;
}
