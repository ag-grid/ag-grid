import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Partial match filter narrows rows on the Name column', async ({ page, agIdFor }) => {
        // default first row is Michael Phelps (Row 1)
        await expect(agIdFor.cell('0', 'name')).toContainText('Michael Phelps');

        await agIdFor.headerFilterButton('name').click();

        const filterInput = page.locator('.partial-match-filter input');
        await expect(filterInput).toBeVisible();

        // "Natalie Coughlin" appears at data index 1 (Row 2) and index 7 (Row 8)
        await filterInput.fill('natalie coughlin');

        // close the popup by clicking a grid cell
        await agIdFor.cell('1', 'name').click();

        // Natalie Coughlin (data index 1 => Row 2) survives; Michael Phelps (row-id 0) is filtered out
        await expect(agIdFor.cell('1', 'name')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('1', 'row')).toContainText('Row 2');
        await expect(agIdFor.cell('0', 'name')).not.toBeVisible();
    });
});
