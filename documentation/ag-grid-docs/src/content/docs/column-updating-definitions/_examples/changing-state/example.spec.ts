import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Stateful attributes are applied when columns are created', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sort='asc' on athlete is applied on creation.
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        // pinned='left' on country moves it to the leftmost position (aria-colindex 1),
        // even though it is defined third in the column list.
        await expect(agIdFor.headerCell('country')).toHaveAttribute('aria-colindex', '1');
    });

    test.eachFramework('Setting columns with state overrides user changes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // User sorts by age instead; this clears the athlete sort.
        await agIdFor.headerCell('age').click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');

        // Re-applying stateful definitions restores athlete's sort and, via defaultColDef
        // sort=null, clears the user's sort on age.
        await page.getByRole('button', { name: 'Set Columns with State' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');
    });
});
