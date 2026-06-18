import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Column group headers for nested objects
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Address' })).toBeVisible();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Scores' })).toBeVisible();

        // Leaf column headers
        await expect(agIdFor.headerCell('name')).toBeVisible();
        await expect(agIdFor.headerCell('address.city')).toBeVisible();
        await expect(agIdFor.headerCell('address.country')).toBeVisible();
        await expect(agIdFor.headerCell('scores.maths')).toBeVisible();
        await expect(agIdFor.headerCell('scores.science')).toBeVisible();

        // Cell data
        await expect(agIdFor.cell('0', 'name')).toContainText('Alice');
        await expect(agIdFor.cell('0', 'address.city')).toContainText('London');
        await expect(agIdFor.cell('0', 'scores.maths')).toContainText('92');
    });
});
