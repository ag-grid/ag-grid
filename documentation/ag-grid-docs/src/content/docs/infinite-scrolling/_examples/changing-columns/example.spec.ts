import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads data with the Year column shown', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-row[row-index="0"]').locator('[col-id="athlete"]')).toContainText(
            'Michael Phelps'
        );
        await expect(agIdFor.headerCell('year')).toBeVisible();
    });

    test.eachFramework(
        'Hide Year and Show Year toggle the column without re-fetching data',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const athlete0 = page.locator('.ag-row[row-index="0"]').locator('[col-id="athlete"]');
            await expect(athlete0).toContainText('Michael Phelps');

            // Hiding the column does not require a data re-fetch, so the row data is unchanged.
            await page.getByText('Hide Year', { exact: true }).click();
            await expect(agIdFor.headerCell('year')).toHaveCount(0);
            await expect(athlete0).toContainText('Michael Phelps');

            await page.getByText('Show Year', { exact: true }).click();
            await expect(agIdFor.headerCell('year')).toBeVisible();
            await expect(athlete0).toContainText('Michael Phelps');
        }
    );
});
