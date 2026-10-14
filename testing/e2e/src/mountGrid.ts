import type { Locator, Page } from '@playwright/test';
import path from 'node:path';

import type { GridApi, GridOptions } from 'ag-grid-community';

declare global {
    interface Window {
        /** The API of the grid `mountGrid` created, for code evaluated in the page. */
        gridApi: GridApi;
    }
}

const GRID_SELECTOR = '#myGrid';
const REPO_ROOT = path.join(__dirname, '../../..');
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

/**
 * Where a UMD bundle comes from, given its path inside the package without the `.js` extension. With `BASE_URL` set it
 * is the site's `/files/<package>/` route, as the vanilla docs examples load it: non-minified from a local dev server,
 * minified from a deployed site. Without it, the local copy under `localDir` (relative to the repository root).
 */
function bundleSource(localDir: string, packagePath: string): { path: string } | { url: string } {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
        return { path: path.join(REPO_ROOT, localDir, `${packagePath}.js`) };
    }
    const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    const minSuffix = LOCAL_HOSTNAMES.includes(base.hostname) ? '' : '.min';
    return { url: new URL(`files/${packagePath}${minSuffix}.js`, base).href };
}

const gridBundle = (packageName: string) => bundleSource('packages', `${packageName}/dist/${packageName}`);

export interface MountGridParams {
    /** Load the enterprise bundle, which registers every enterprise module, instead of the community one. */
    enterprise?: boolean;
    /** Also load the AG Charts Enterprise bundle, which the enterprise bundle registers integrated charts with. */
    integratedCharts?: boolean;
    width?: number;
    height?: number;
    /** Extra CSS for the page, such as an application's style overrides. */
    css?: string;
    /** Classes for the grid's container element, such as a legacy theme's `ag-theme-*` class. */
    className?: string;
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
    {
        enterprise = false,
        integratedCharts = false,
        width = 800,
        height = 500,
        css,
        className = '',
        options,
    }: MountGridParams
): Promise<MountedGrid> {
    await page.setContent(
        `<!DOCTYPE html><html><head><style>*{margin:0}${GRID_SELECTOR}{width:${width}px;height:${height}px}</style></head>` +
            `<body><div id="myGrid" class="${className}"></div></body></html>`
    );
    if (css) {
        await page.addStyleTag({ content: css });
    }
    if (integratedCharts) {
        await page.addScriptTag(bundleSource('node_modules', 'ag-charts-enterprise/dist/umd/ag-charts-enterprise'));
    }
    await page.addScriptTag(gridBundle(enterprise ? 'ag-grid-enterprise' : 'ag-grid-community'));
    await page.evaluate(
        ({ optionsSource, selector }) => {
            const gridOptions = new Function(`return (${optionsSource})()`)();
            const gridDiv = document.querySelector<HTMLElement>(selector)!;
            window.gridApi = (window as any).agGrid.createGrid(gridDiv, gridOptions);
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
