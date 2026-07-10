import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Starts with no column groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Buttons add and remove column groups while preserving columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page
            .locator('button')
            .filter({ hasText: /^Medals in Group$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' })).toHaveCount(1);
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        await page
            .locator('button')
            .filter({ hasText: /^Participant in Group$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Participant' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' })).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page
            .locator('button')
            .filter({ hasText: /^No Groups$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell')).toHaveCount(0);
    });
});
