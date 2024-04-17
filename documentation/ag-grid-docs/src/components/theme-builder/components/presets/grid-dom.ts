import { atom, useAtomValue, useSetAtom } from 'jotai';

export const gridDomAtom = atom<HTMLElement | null>(null);

export const useGridDom = () => useAtomValue(gridDomAtom);

export const useSetGridDom = () => useSetAtom(gridDomAtom);

const gridPreviewHTML = atom((get) => {
    const liveGrid = get(gridDomAtom);
    if (!liveGrid) return '';
    const clone = liveGrid.cloneNode(true) as HTMLDivElement;
    // remove elements that don't look good in previews
    deleteAll(clone, '.ag-advanced-filter-header');
    deleteAll(clone, '.ag-header-row:not(:last-of-type)'); // leave last header row, column grouping doesn't look good

    // trim down the DOM, removing invisible items for performance
    deleteAll(clone, '.ag-side-bar');
    deleteAll(clone, '.ag-status-bar');
    deleteAll(clone, '.ag-paging-panel');
    deleteAll(clone, '.ag-hidden');
    deleteAll(clone, '.ag-row:not(:nth-of-type(-n+7))'); // leave first 7 rows
    deleteAll(clone, ':is(.ag-cell, .ag-header-cell):not(:nth-of-type(-n+2))'); // leave first 2 columns

    // remove the explicit heights set by grid code so that the preview grids
    // can respond to variables like --ag-row-height
    resetHeights(clone, ['.ag-row', '.ag-header-row', '.ag-header-cell', '.ag-header'], '');
    resetHeights(clone, ['.ag-header'], 'var(--ag-header-height)');

    return clone.outerHTML;
});

const resetHeights = (parent: HTMLElement, selectors: string[], height: string) => {
    for (const selector of selectors) {
        for (const el of parent.querySelectorAll(selector)) {
            const row = el as HTMLElement;
            row.style.top = '';
            row.style.height = height;
            row.style.minHeight = height;
            row.style.maxHeight = height;
            row.style.transform = '';
            row.style.position = 'static';
        }
    }
};

const deleteAll = (parent: HTMLElement, selector: string) => {
    parent.querySelectorAll(selector).forEach((el) => el.remove());
};

export const useGridPreviewHTML = () => useAtomValue(gridPreviewHTML);
