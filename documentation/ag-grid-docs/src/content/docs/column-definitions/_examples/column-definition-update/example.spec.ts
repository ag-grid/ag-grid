import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Updating column definitions changes the header names', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Default headers are derived from the field names.
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');
        await expect(agIdFor.headerCell('age')).toContainText('Age');

        await page.getByRole('button', { name: 'Update Header Names' }).click();
        await expect(agIdFor.headerCell('athlete')).toContainText('C1');
        await expect(agIdFor.headerCell('age')).toContainText('C2');

        await page.getByRole('button', { name: 'Restore Original Column Definitions' }).click();
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');
        await expect(agIdFor.headerCell('age')).toContainText('Age');
    });
});
