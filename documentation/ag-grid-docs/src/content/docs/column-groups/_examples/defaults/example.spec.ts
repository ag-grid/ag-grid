import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'defaultColGroupDef applies the shared header name to every group',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Neither group defines headerName, so both inherit it from defaultColGroupDef.
            const sharedGroups = page
                .locator('.ag-header-group-cell')
                .filter({ hasText: 'A shared prop for all Groups' });
            await expect(sharedGroups).toHaveCount(2);

            // Data is loaded under the grouped columns.
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'total')).toContainText('8');
        }
    );

    test.eachFramework('Opening a group reveals its open-only medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);

        const secondGroup = page
            .locator('.ag-header-group-cell')
            .filter({ hasText: 'A shared prop for all Groups' })
            .last();
        await secondGroup.locator('.ag-header-expand-icon-collapsed').first().click();

        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });
});
