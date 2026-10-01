import type { Locator, Page } from '@playwright/test';
import path from 'node:path';

import type { GridApi, GridOptions } from 'ag-grid-community';

const GRID_SELECTOR = '#myGrid';
const DIST = path.join(__dirname, '../../../packages');

export interface MountGridParams {
    /** Load the enterprise bundle, which registers every enterprise module, instead of the community one. */
    enterprise?: boolean;
    width?: number;
    height?: number;
    /**
     * Builds the grid options inside the page. It is serialised with `toString()`, so it must be
     * self-contained: it cannot close over variables from the spec.
     */
    options: () => GridOptions;
}

export interface MountedGrid {
    grid: Locator;
    cell(rowIndex: number, colId: string): Locator;
    headerCell(colId: string): Locator;
    /** Runs `fn` in the page with the grid API as its argument. */
    withApi<T>(fn: (api: GridApi) => T): Promise<T>;
}

export async function mountGrid(
    page: Page,
    { enterprise = false, width = 800, height = 500, options }: MountGridParams
): Promise<MountedGrid> {
    const bundle = enterprise
        ? path.join(DIST, 'ag-grid-enterprise/dist/ag-grid-enterprise.js')
        : path.join(DIST, 'ag-grid-community/dist/ag-grid-community.js');

    await page.setContent(
        `<!DOCTYPE html><html><head><style>*{margin:0}${GRID_SELECTOR}{width:${width}px;height:${height}px}</style></head>` +
            `<body><div id="myGrid"></div></body></html>`
    );
    await page.addScriptTag({ path: bundle });
    await page.evaluate(
        ({ optionsSource, selector }) => {
            const gridOptions = new Function(`return (${optionsSource})()`)();
            const gridDiv = document.querySelector<HTMLElement>(selector)!;
            (window as any).gridApi = (window as any).agGrid.createGrid(gridDiv, gridOptions);
        },
        { optionsSource: options.toString(), selector: GRID_SELECTOR }
    );

    const grid = page.locator(GRID_SELECTOR);
    await grid.locator('.ag-root-wrapper').waitFor();

    return {
        grid,
        cell: (rowIndex, colId) => grid.locator(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${colId}"]`),
        headerCell: (colId) => grid.locator(`.ag-header-cell[col-id="${colId}"]`),
        withApi: (fn) => page.evaluate(`(${fn.toString()})(window.gridApi)`) as Promise<ReturnType<typeof fn>>,
    };
}
