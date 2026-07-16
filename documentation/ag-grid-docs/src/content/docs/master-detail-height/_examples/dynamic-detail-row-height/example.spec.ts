import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'getRowHeight sizes each detail row by its number of call records',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // onFirstDataRendered auto-expands the master row at index 1 (Mila Smith, 10 call records).
            // Expand the first master row too (Nora Thomas, 5 call records).
            await agIdFor.groupContracted('0', 'name').click();

            // Detail grids use domLayout autoHeight, so every record renders. Distinguish the two
            // detail grids by their first call id: row 0 -> 555, row 1 -> 579.
            const detailShort = page
                .locator('.ag-details-row')
                .filter({ has: page.locator('[col-id="callId"]', { hasText: '555' }) })
                .first();
            const detailTall = page
                .locator('.ag-details-row')
                .filter({ has: page.locator('[col-id="callId"]', { hasText: '579' }) })
                .first();

            await expect(detailShort).toBeVisible();
            await expect(detailTall).toBeVisible();

            // 5 records vs 10 records rendered in each detail grid.
            await expect(detailShort.locator('.ag-row')).toHaveCount(5);
            await expect(detailTall.locator('.ag-row')).toHaveCount(10);

            // getRowHeight scales the detail row height by callRecords.length, so the 10-record
            // detail is measurably taller than the 5-record detail.
            const boxShort = await detailShort.boundingBox();
            const boxTall = await detailTall.boundingBox();
            expect(boxShort).not.toBeNull();
            expect(boxTall).not.toBeNull();
            expect(boxTall!.height).toBeGreaterThan(boxShort!.height + 100);
        }
    );
});
