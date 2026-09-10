import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

function scrollingContainer(page: Page) {
    return page.locator('.ag-grid-scrolling-container').first();
}

function headerCell(page: Page, colId: string) {
    return page.locator(`.ag-header-cell[col-id="${colId}"]`).first();
}

function headerCells(page: Page) {
    return page.locator('.ag-header-cell[col-id]');
}

async function columnWidth(page: Page, colId: string): Promise<number> {
    return (await headerCell(page, colId).boundingBox())?.width ?? 0;
}

async function totalColumnWidth(page: Page): Promise<number> {
    return page.evaluate(() =>
        [...document.querySelectorAll('.ag-header-cell[col-id]')].reduce(
            (sum, cell) => sum + cell.getBoundingClientRect().width,
            0
        )
    );
}

async function availableWidth(page: Page): Promise<number> {
    return scrollingContainer(page).evaluate((element) => element.clientWidth);
}

async function expectColumnsToFillGrid(page: Page): Promise<void> {
    await expect(async () => {
        const total = await totalColumnWidth(page);
        const available = await availableWidth(page);
        expect(Math.abs(total - available)).toBeLessThanOrEqual(2);
    }).toPass();

    const overflow = await scrollingContainer(page).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
}

async function waitForChangeFrom(previous: number, sample: () => Promise<number>): Promise<number> {
    await expect(async () => {
        expect(await sample()).not.toBe(previous);
    }).toPass();
    return sample();
}

test.agExample(import.meta, () => {
    test.eachFramework('distributes the grid width across the columns on load', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(headerCells(page)).toHaveCount(5);
        await expectColumnsToFillGrid(page);
    });

    test.eachFramework(
        'each added column takes space from the others, and removing gives it back',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await expectColumnsToFillGrid(page);

            const firstColumnWidth = await columnWidth(page, 'column1');
            let previousWidth = firstColumnWidth;

            for (const expectedCount of [6, 7, 8]) {
                await page.locator('button.add-column-button').click();
                await expect(headerCells(page)).toHaveCount(expectedCount);

                const narrowed = await waitForChangeFrom(previousWidth, () => columnWidth(page, 'column1'));
                expect(narrowed).toBeLessThan(previousWidth);
                await expectColumnsToFillGrid(page);
                previousWidth = narrowed;
            }

            for (const expectedCount of [7, 6, 5]) {
                await page.locator('button.remove-column-button').click();
                await expect(headerCells(page)).toHaveCount(expectedCount);

                const widened = await waitForChangeFrom(previousWidth, () => columnWidth(page, 'column1'));
                expect(widened).toBeGreaterThan(previousWidth);
                await expectColumnsToFillGrid(page);
                previousWidth = widened;
            }

            expect(previousWidth).toBeCloseTo(firstColumnWidth, 0);
        }
    );

    test.eachFramework('adding and removing rows keeps the columns filling the grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expectColumnsToFillGrid(page);

        const rows = page.locator('.ag-row');
        await expect(rows).toHaveCount(4);

        await page.locator('button.add-rows-button').click();
        await expect(async () => {
            expect(await rows.count()).toBeGreaterThan(4);
        }).toPass();
        await expectColumnsToFillGrid(page);

        await page.locator('button.add-rows-button').click();
        await expectColumnsToFillGrid(page);

        await page.locator('button.remove-rows-button').click();
        await expectColumnsToFillGrid(page);

        await page.locator('button.remove-rows-button').click();
        await expect(rows).toHaveCount(4);
        await expectColumnsToFillGrid(page);
    });

    test.eachFramework('resizing the grid re-distributes the width', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expectColumnsToFillGrid(page);

        const wideTotal = await totalColumnWidth(page);

        await page.locator('button.narrower-button').click();
        const narrowTotal = await waitForChangeFrom(wideTotal, () => totalColumnWidth(page));
        expect(narrowTotal).toBeLessThan(wideTotal);
        await expectColumnsToFillGrid(page);

        await page.locator('button.wider-button').click();
        await expect(async () => {
            expect(await totalColumnWidth(page)).toBeCloseTo(wideTotal, 0);
        }).toPass();
        await expectColumnsToFillGrid(page);
    });
});
