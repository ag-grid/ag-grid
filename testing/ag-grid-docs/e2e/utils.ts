import type { Page } from '@playwright/test';

/**
 * Wait for the grid to finish rendering and for the cells to be visible
 */
export async function waitForGridReady(page: Page) {
    await page.locator('ag-overlay-loading-center').first().waitFor({ state: 'hidden' });
    // Normal cells
    const cellLocator = page.locator('.ag-cell');
    // Grouped cells
    const cellWrapperLocator = page.locator('.ag-cell-wrapper');
    // Full width only cells
    const fullWidthRow = page.locator('.ag-full-width-row');
    // No rows to show
    const noRowsToShowLocator = page.locator('.ag-overlay-no-rows-center');
    await cellLocator
        .or(cellWrapperLocator)
        .or(noRowsToShowLocator)
        .or(fullWidthRow)
        .first()
        .waitFor({ state: 'visible' });
}

export async function clickAllButtons(page: Page) {
    // Click all visible buttons in the grid example
    // Don't use buttons within the ag-root-wrapper as these are not part of the example
    // and will cause the test to fail if they are clicked
    const buttons = page.locator('button:visible:not([disabled]):not(.ag-root-wrapper button):not(.ag-chart button)');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click();
    }
}

export type ColumnLocatorOptions = {
    colId?: string;
    colHeaderName?: string;
};

/**
 * Returns the total number of rows in the grid
 */
export async function getRowCountOrError(page: Page): Promise<number | string> {
    // We have to subtract the number of header rows from the total aria-rowcount to get the actual row count

    const headerOrError = page.locator('.ag-header .ag-header-row').or(page.locator('.example-error')).first();

    const text = await headerOrError.textContent();
    // Matches the error message in SystemJs example config
    if (text?.includes('Example Error:')) {
        return text;
    }

    const headers = await page.locator('.ag-header .ag-header-row').and(page.getByRole('row')).all();
    const gridLocator = page.getByRole('treegrid').or(page.getByRole('grid'));
    const totalAriaRowCount = await gridLocator.first().getAttribute('aria-rowcount');
    return Number(totalAriaRowCount) - Number(headers.length);
}

/**
 * Returns a locator for the header cell
 */
export function getHeaderLocator(page: Page, options: ColumnLocatorOptions) {
    if (options.colHeaderName) {
        return page.getByRole('columnheader', { name: options.colHeaderName });
    }
    return page.getByRole('columnheader').and(page.locator(`[col-id="${options.colId}"]`));
}

/**
 * Returns a locator for the cell based off colId and rowIndex
 */
export function getCellLocator(page: Page, colId: string, rowIndex: number) {
    const locatorString = `[row-index="${rowIndex}"] [col-id="${colId}"]`;
    return page.locator(locatorString);
}

/**
 * Returns a locator for the row based off rowIndex
 */
export function getRowLocator(page: Page, rowIndex: number) {
    const locatorString = `[row-index="${rowIndex}"]`;
    return page.locator(locatorString);
}

/**
 * Returns the contents of the row as an array of string values
 */
export async function getRowContents(page: Page, rowIndex: number) {
    const cells = await getRowLocator(page, rowIndex).getByRole('gridcell').all();

    // Return the cell values in the order they appear to the user not the order they appear in the DOM
    const cellValues = Array(cells.length);
    for (let i = 0; i < cells.length; i++) {
        const colIndex = Number(await cells[i].getAttribute('aria-colindex'));
        // innerText works better for grouping
        cellValues[colIndex - 1] = await cells[i].innerText();
    }
    return cellValues;
}

export type CellLocatorOptions = {
    rowIndex: number;
    colId?: string;
    colHeaderName?: string;
};

/**
 * Returns a locator for the cell based off rowIndex and either colId or colHeaderName
 */
export async function getCellLocatorBy(page: Page, options: CellLocatorOptions) {
    let colId: string | null | undefined = options.colId;
    if (!colId && options.colHeaderName) {
        const headerCell = page.getByRole('columnheader', {
            name: options.colHeaderName,
        });
        colId = await headerCell.getAttribute('col-id');
    }
    return getCellLocator(page, colId!, options.rowIndex);
}

/**
 * Returns a test object with helper methods for interacting with AG Grid for the given page.
 */
export function agGridTest(page: Page) {
    return {
        waitForCells: async () => {
            await waitForGridReady(page);
        },
        getRowCountOrError: async () => {
            return await getRowCountOrError(page);
        },
        getHeaderLocator: (options: ColumnLocatorOptions) => {
            return getHeaderLocator(page, options);
        },
        getCellLocator: (colId: string, rowIndex: number) => {
            return getCellLocator(page, colId, rowIndex);
        },
        getRowLocator: (rowIndex: number) => {
            return getRowLocator(page, rowIndex);
        },
        getRowContents: (rowIndex: number) => {
            return getRowContents(page, rowIndex);
        },
        getCellLocatorBy: (options: CellLocatorOptions) => {
            return getCellLocatorBy(page, options);
        },
    };
}
