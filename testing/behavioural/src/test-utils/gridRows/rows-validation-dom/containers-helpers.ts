/** Determines which row container an element belongs to. */
export function getRowContainerType(el: HTMLElement): string {
    const containerSelectors: [string, string][] = [
        ['.ag-center-cols-container', 'center'],
        ['.ag-pinned-left-cols-container', 'left'],
        ['.ag-pinned-right-cols-container', 'right'],
        ['.ag-floating-top-container', 'floating-top'],
        ['.ag-floating-bottom-container', 'floating-bottom'],
        ['.ag-full-width-container', 'full-width'],
        ['.ag-sticky-top-container', 'sticky-top'],
        ['.ag-sticky-bottom-container', 'sticky-bottom'],
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
