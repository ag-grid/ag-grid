import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Initial attributes are applied when columns are created', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // initialSort='asc' on athlete is applied on creation.
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        // initialPinned='left' on country moves it to the leftmost position (aria-colindex 1),
        // even though it is defined third in the column list.
        await expect(agIdFor.headerCell('country')).toHaveAttribute('aria-colindex', '1');
    });

    test.eachFramework('Setting columns with initials does not reset user changes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // User sorts by age instead; this clears the athlete sort.
        await agIdFor.headerCell('age').click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');

        // Re-applying the initial definitions does NOT restore athlete's initialSort;
        // the user's sort on age is preserved because initial values only apply on creation.
        await page.getByRole('button', { name: 'Set Columns with Initials' }).click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
    });

    test.eachFramework('Removing and re-adding columns applies initials again', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Remove Columns' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);

        // Recreating the columns re-applies the initial sort.
        await page.getByRole('button', { name: 'Set Columns with Initials' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
    });
});
