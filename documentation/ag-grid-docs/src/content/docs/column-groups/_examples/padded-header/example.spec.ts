import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Age gets an empty padded group header cell above it', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // suppressSpanHeaderHeight: two group-header cells exist — 'Athlete Details' plus an empty padded one above Age.
        const groupCells = page.locator('.ag-header-group-cell');
        await expect(groupCells).toHaveCount(2);
        await expect(groupCells.filter({ hasText: 'Athlete Details' })).toHaveCount(1);

        // The Age header does NOT span the full height (unlike the span-header-height example).
        const ageHeader = page.locator('.ag-header-cell[col-id="age"]').first();
        const groupHeader = groupCells.filter({ hasText: 'Athlete Details' }).first();
        const ageHeight = await ageHeader.evaluate((el) => el.getBoundingClientRect().height);
        const groupHeight = await groupHeader.evaluate((el) => el.getBoundingClientRect().height);
        expect(Math.abs(ageHeight - groupHeight)).toBeLessThan(5);

        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('Sorting the Age column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('age').click();
        await expect(page.locator('.ag-row[row-index="0"] [col-id="age"]')).not.toContainText('23');
    });
});
