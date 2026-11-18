import type { JSHandle, Page } from 'playwright/test';

import type { GridApi, getGridApi } from 'ag-grid-community';

declare global {
    interface Window {
        /** The grid's own `getGridApi`, which examples expose in test mode. */
        getGridApi: typeof getGridApi;
    }
}

/**
 * A handle to the `GridApi` of a grid on the page, found by grid ID, CSS selector or element, as
 * `getGridApi` accepts. Call its methods in the page with `handle.evaluate((api) => ...)`.
 */
export async function gridApiHandle(page: Page, grid: string = '1'): Promise<JSHandle<GridApi>> {
    return page.evaluateHandle((grid) => {
        const api = window.getGridApi(grid);
        if (!api) {
            throw new Error(`getGridApi('${grid}') found no grid`);
        }
        return api;
    }, grid);
}
