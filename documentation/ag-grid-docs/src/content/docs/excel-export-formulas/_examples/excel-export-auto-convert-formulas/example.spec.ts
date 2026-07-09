import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Full Name valueGetter combines first and last name', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'firstName')).toContainText('Mair');
        await expect(agIdFor.cell('0', 'lastName')).toContainText('Inworth');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'company')).toContainText('Rhyzio');
        await expect(agIdFor.rowNode('0')).toContainText('Mair Inworth');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Ferrell Towhey (data index 9) has the unique maximum age of 40.
        const ferrell = agIdFor.rowNode('9');
        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(ferrell).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(ferrell).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Export to Excel button does not error', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Export to Excel' }).click();
        await expect(page.locator('.ag-root')).toBeVisible();
    });
});
