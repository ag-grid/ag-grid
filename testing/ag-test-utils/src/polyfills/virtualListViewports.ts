/**
 * Viewports whose VirtualList renders nothing without a forced height. Shared by `mockGridLayout` (which
 * routes their height props at the rect) and `filterLayoutMock` (which forces the rect itself) — one list,
 * since two copies of it drifted while meaning the same thing. Deliberately not on the package barrel.
 */
export const VIRTUAL_LIST_VIEWPORT_CLASSES = [
    '.ag-advanced-filter-builder-virtual-list-viewport',
    '.ag-rich-select-virtual-list-viewport',
    '.ag-advanced-filter-builder-list',
    // The builder root is the drag drop-target container; it needs a tall rect so the drag hover hit-test
    // (clientY within the container, row = clientY / rowHeight) can reach every row.
    '.ag-advanced-filter-builder',
    '.ag-virtual-list-viewport',
] as const;
