import type { Page } from 'playwright/test';

import type * as AgGridCommunity from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

declare global {
    interface Window {
        /** The UMD bundle's namespace, on pages that load the grid that way. */
        agGrid?: typeof AgGridCommunity;
    }
}

/**
 * Replaces a grid with one created from `gridOptions`, in the same container. Needs the UMD bundle's `agGrid`
 * global, and `gridOptions` must be JSON data, as it is sent to the page. Take a new `gridApiHandle` afterwards: earlier ones hold the
 * destroyed grid's API.
 */
export async function recreateGrid(page: Page, gridOptions: GridOptions, grid: string = '1'): Promise<void> {
    await page.evaluate(
        ({ optionsJson, grid }) => {
            const { agGrid } = window;
            if (!agGrid) {
                throw new Error('recreateGrid needs the UMD bundle, which exposes `agGrid`');
            }
            const container = document.querySelector<HTMLElement>('#myGrid')!;
            window.getGridApi(grid)?.destroy();
            agGrid.createGrid(container, { ...JSON.parse(optionsJson), gridId: grid });
            window.getGridApi = agGrid.getGridApi;
        },
        { optionsJson: JSON.stringify(gridOptions), grid }
    );
}
