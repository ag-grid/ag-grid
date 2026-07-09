import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Importing the sample Excel file populates auto-generated columns',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // The grid starts empty - no data rows exist until the Excel file is imported.
            await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();

            await page.getByRole('button', { name: 'Load Sample Excel' }).click();

            // Columns are auto-generated from the imported sheet keys, and the first
            // row of olympic-data.xlsx is Gong Jinjie (China, age 25).
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Gong Jinjie');
            await expect(agIdFor.cell('0', 'country')).toContainText('China');
            await expect(agIdFor.cell('0', 'age')).toContainText('25');
            await expect(agIdFor.cell('1', 'athlete')).toContainText('Olga Kaniskina');
        }
    );

    test.eachFramework('Imported data can be sorted by an auto-generated column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await page.getByRole('button', { name: 'Load Sample Excel' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Gong Jinjie');

        // Fredrik Lööf (data index 6) has the unique maximum age (42).
        const oldest = agIdFor.rowNode('6');
        await expect(oldest).toHaveAttribute('row-index', '6');

        await agIdFor.headerCell('age').click(); // ascending: oldest floats to the bottom
        await waitForRowAnimations(page);
        await expect(oldest).toHaveAttribute('row-index', '8');

        await agIdFor.headerCell('age').click(); // descending: oldest floats to the top
        await waitForRowAnimations(page);
        await expect(oldest).toHaveAttribute('row-index', '0');
    });
});
