import type { JSHandle, Page } from 'playwright/test';

import type { GridApi, getGridApi } from 'ag-grid-community';

declare global {
    interface Window {
        /** The grid's own `getGridApi`, which examples expose in test mode. */
        getGridApi: typeof getGridApi;
    }
}

/**
 * A handle to the `GridApi` of a grid on the page, found by grid ID or CSS selector, as `getGridApi`
 * accepts, once that grid exists. Call its methods in the page with `handle.evaluate((api) => ...)`.
 */
export async function gridApiHandle(page: Page, grid: string = '1'): Promise<JSHandle<GridApi>> {
    const found = await page.waitForFunction((grid) => {
        // Archived sites before v34 do not expose `getGridApi`, so read the API off a rendered cell instead.
        const getApi =
            window.getGridApi ??
            ((): GridApi | undefined => {
                const cell = document.querySelector('#myGrid .ag-cell');
                const key = cell && Object.keys(cell).find((name) => name.startsWith('__AG'));
                return key ? Reflect.get(cell, key)?.cellCtrl?.beans?.gridApi : undefined;
            });
        return getApi(grid) ?? false;
    }, grid);
    return found.evaluateHandle((api) => {
        if (!api) {
            throw new Error('gridApiHandle: no grid API');
        }
        return api;
    });
}
