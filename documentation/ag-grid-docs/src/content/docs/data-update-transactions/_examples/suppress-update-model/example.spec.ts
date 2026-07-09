import { expect, test } from '@utils/grid/test-utils';

// Reads the row-id of every rendered row, ordered by row-index.
const idsByRowIndex = (page: import('@playwright/test').Page) =>
    page.$$eval('.ag-grid-scrolling-container .ag-row', (rows) =>
        rows
            .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            .map((r) => r.getAttribute('row-id'))
    );

// Reads the numeric value cell of every rendered row, ordered by row-index.
const valuesByRowIndex = (page: import('@playwright/test').Page) =>
    page.$$eval('.ag-grid-scrolling-container .ag-row', (rows) =>
        rows
            .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            .map((r) => Number(r.querySelector('[col-id="value"]')?.textContent))
    );

const isDescending = (values: number[]) => values.every((v, i) => i === 0 || values[i - 1] >= v);

test.agExample(import.meta, () => {
    // suppressModelUpdateAfterUpdateTransaction=true: an update-only transaction does
    // NOT re-sort/re-filter. Refresh Model re-applies sort + filter on demand.
    test.eachFramework(
        'Apply Transaction leaves row order untouched until Refresh Model',
        async ({ agIdFor, page }) => {
            // Wait for the grid (with its initial set filter applied) to render.
            await expect(agIdFor.headerCell('value')).toBeVisible();

            // value column is sorted descending initially.
            const initialValues = await valuesByRowIndex(page);
            expect(initialValues.length).toBeGreaterThan(0);
            expect(isDescending(initialValues)).toBe(true);

            const orderBefore = await idsByRowIndex(page);

            // Apply Transaction updates every row's value but the model is not re-sorted,
            // so the rows stay in exactly the same positions.
            await page.getByRole('button', { name: 'Apply Transaction' }).click();
            const orderAfterApply = await idsByRowIndex(page);
            expect(orderAfterApply).toEqual(orderBefore);

            // Refresh Model re-sorts, so the value column is descending again.
            await page.getByRole('button', { name: 'Refresh Model' }).click();
            // Retry the read-back until the sort + re-render has settled and values are descending again.
            await expect(async () => {
                expect(isDescending(await valuesByRowIndex(page))).toBe(true);
            }).toPass();
        }
    );
});
