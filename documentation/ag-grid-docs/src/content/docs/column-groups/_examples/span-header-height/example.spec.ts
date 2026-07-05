import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Age column spans the full header height beside the group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' })).toHaveCount(1);
        await expect(page.locator('.ag-header-cell[col-id="age"]').first()).toBeVisible();

        // The ungrouped Age header cell spans both header rows (no padded group cell above it).
        const ageHeader = page.locator('.ag-header-cell[col-id="age"]').first();
        const groupHeader = page.locator('.ag-header-group-cell').first();
        const ageHeight = await ageHeader.evaluate((el) => el.getBoundingClientRect().height);
        const groupHeight = await groupHeader.evaluate((el) => el.getBoundingClientRect().height);
        expect(ageHeight).toBeGreaterThan(groupHeight);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('Sorting the spanned Age column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('age').click();
        // Ascending sort by age puts the youngest athlete first (age 23 is not the minimum).
        await expect(page.locator('.ag-row[row-index="0"] [col-id="age"]')).not.toContainText('23');
    });
});
