import { Page } from '@playwright/test';

export async function goToAndWaitForData(page: Page, url: string) {
    await page.goto(url);
    await page.locator('.ag-overlay').first().waitFor({ state: 'hidden' });
    await page.locator('.ag-center-cols-viewport .ag-cell').first().waitFor({ state: 'visible' });
}

export type ColumnLocatorOptions = {
    colId?: string;
    colHeaderName?: string;
}

export async function getRowCount(page: Page) {
    // We have to subtract the number of header rows from the total aria-rowcount to get the actual row count
    const headers = await page.locator('.ag-header .ag-header-row').and(page.getByRole('row')).all();    
    const totalAriaRowCount = await page.getByRole('treegrid').getAttribute('aria-rowcount');    
    return Number(totalAriaRowCount) - Number(headers.length);
}

export async function getCellHeaderLocator(page: Page, options: ColumnLocatorOptions) {
    
    if (options.colHeaderName) {
        return page.getByRole('columnheader', { name: options.colHeaderName });        
    }
    return page.getByRole('columnheader').and(page.locator(`[col-id="${options.colId}"]`));    
}

export function getCellLocator(page: Page, colId: string, rowIndex: number) {
   const locatorString = `[row-index="${rowIndex}"] [col-id="${colId}"]`;
   return page.locator(locatorString);
}

export function getRowLocator(page: Page, rowIndex: number) {
    const locatorString = `[row-index="${rowIndex}"]`;
    return page.locator(locatorString);
}

export async function getRowContents(page: Page, rowIndex: number) {
    const cells = await getRowLocator(page, rowIndex).getByRole('gridcell').all();

    // Return the cell values in the order they appear to the user not the order they appear in the DOM
    const cellValues = Array(cells.length);
    for (let i = 0; i < cells.length; i++) {
        const colIndex = Number(await cells[i].getAttribute('aria-colindex'));
        cellValues[colIndex - 1] = await cells[i].textContent();
    }
    return cellValues;
}

export type CellLocatorOptions = {
    rowIndex: number;
    colId?: string;
    colHeaderName?: string;
}

export async function getCellLocatorBy(page: Page, options: CellLocatorOptions ) {
    let colId = options.colId;
    if (!colId && options.colHeaderName) {
        const headerCell = page.getByRole('columnheader', { name: options.colHeaderName });
        colId = await headerCell.getAttribute('col-id');
    }
    return getCellLocator(page, colId, options.rowIndex);
}