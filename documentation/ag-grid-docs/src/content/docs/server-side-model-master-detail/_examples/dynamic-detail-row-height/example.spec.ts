import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('getRowHeight sizes each detail row by its number of call records', async ({ page }) => {
        await waitForGridContent(page);

        const masterRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('[col-id="name"]', { hasText: name }) })
                .first();

        // Liam Padberg has 15 call records; expand his master row.
        await expect(masterRow('Liam Padberg')).toBeVisible();
        await masterRow('Liam Padberg').locator('.ag-group-contracted').first().click();

        // Helene Ferry (29 call records) is auto-expanded on load via onGridReady.
        const detailShort = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="callId"]', { hasText: '2000' }) })
            .first();
        const detailTall = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="callId"]', { hasText: '2015' }) })
            .first();

        await expect(detailShort).toBeVisible();
        await expect(detailTall).toBeVisible();

        // Detail grids use autoHeight so every record renders: 15 vs 29 rows.
        await expect(detailShort.locator('.ag-row')).toHaveCount(15);
        await expect(detailTall.locator('.ag-row')).toHaveCount(29);

        // getRowHeight scales the detail row height by callRecords.length, so the 29-record
        // detail is measurably taller than the 15-record detail.
        const boxShort = await detailShort.boundingBox();
        const boxTall = await detailTall.boundingBox();
        expect(boxShort).not.toBeNull();
        expect(boxTall).not.toBeNull();
        expect(boxTall!.height).toBeGreaterThan(boxShort!.height + 200);
    });
});
