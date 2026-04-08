import { expect, test } from '@utils/grid/test-utils';

const eachInteractiveFramework = (testName: string, testBody: Parameters<typeof test.typescript>[1]) => {
    test.describe(testName, () => {
        test.typescript('typescript', testBody);
        test.vanilla('vanilla', testBody);
        test.reactFunctionalTs('reactFunctionalTs', testBody);
        test.reactFunctionalTs_Dev('reactFunctionalTs_Dev', testBody);
        test.vue3('vue3', testBody);
    });
};

test.agExample(import.meta, () => {
    test.eachFramework('Pre-seeded note indicator on row 2 athlete', async ({ agIdFor }) => {
        // Row 2 athlete has a pre-seeded note
        await expect(agIdFor.cell('2', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        // Row 1 athlete has no note
        await expect(agIdFor.cell('1', 'athlete')).not.toHaveClass(/ag-has-cell-notes/);
    });

    eachInteractiveFramework('Click cell loads note into controls', async ({ agIdFor, page }) => {
        // Click cell with existing note
        await agIdFor.cell('2', 'athlete').click();

        const statusEl = page.locator('#selection-status');
        await expect(statusEl).toContainText('Loaded note');

        const textarea = page.locator('#note-text');
        await expect(textarea).toHaveValue('Follow up with the regional team before publishing this profile.');
    });

    eachInteractiveFramework('Save note via API adds indicator', async ({ agIdFor, page }) => {
        // Click a cell without a note
        const cell = agIdFor.cell('1', 'athlete');
        await cell.click();
        await expect(cell).not.toHaveClass(/ag-has-cell-notes/);
        await expect(page.locator('#selection-status')).toContainText('No note stored');

        // Fill in note text and save
        await page.locator('#note-text').fill('Test note from API');
        await page.locator('button', { hasText: 'Save via API' }).click();

        // Cell should now have the note indicator
        await expect(cell).toHaveClass(/ag-has-cell-notes/);
        await expect(page.locator('#selection-status')).toContainText('Saved note');
    });

    eachInteractiveFramework('Remove note via API removes indicator', async ({ agIdFor, page }) => {
        // Click cell with existing note
        const cell = agIdFor.cell('2', 'athlete');
        await cell.click();
        await expect(page.locator('#selection-status')).toContainText('Loaded note');
        await expect(cell).toHaveClass(/ag-has-cell-notes/);

        // Remove the note
        await page.locator('button', { hasText: 'Remove via API' }).click();

        // Indicator should be removed
        await expect(cell).not.toHaveClass(/ag-has-cell-notes/);
        await expect(page.locator('#selection-status')).toContainText('Removed note');
    });

    eachInteractiveFramework('Mutate store directly then refresh syncs grid', async ({ agIdFor, page }) => {
        // Click a cell without a note
        const cell = agIdFor.cell('4', 'country');
        await cell.click();
        await expect(cell).not.toHaveClass(/ag-has-cell-notes/);
        await expect(page.locator('#selection-status')).toContainText('No note stored');

        // Mutate the store directly — grid should not update yet
        await page.locator('button', { hasText: 'Mutate Store Directly' }).click();
        await expect(page.locator('#selection-status')).toContainText('Updated the store directly');
        await expect(cell).not.toHaveClass(/ag-has-cell-notes/);

        // Refresh notes — grid should now reflect the store
        await page.locator('button', { hasText: 'Refresh Notes' }).click();
        await expect(cell).toHaveClass(/ag-has-cell-notes/);
    });
});
