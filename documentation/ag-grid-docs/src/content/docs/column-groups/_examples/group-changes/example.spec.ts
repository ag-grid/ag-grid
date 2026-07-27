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
        // Rebuilding the column groups re-renders the whole header several times; under a loaded
        // CI machine this can eat into the default budget, so allow extra time.
        test.slow();
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Anchored but whitespace-tolerant: the Angular and Vue generators reformat the longer
        // button labels onto their own lines, so the element's text is padded with newlines.
        await page
            .locator('button')
            .filter({ hasText: /^\s*Medals in Group\s*$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' })).toHaveCount(1);
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        await page
            .locator('button')
            .filter({ hasText: /^\s*Participant in Group\s*$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Participant' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' })).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page
            .locator('button')
            .filter({ hasText: /^\s*No Groups\s*$/ })
            .click();
        await expect(page.locator('.ag-header-group-cell')).toHaveCount(0);
    });
});
