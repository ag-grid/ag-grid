import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Medal columns toggle while matched columns are retained', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Athlete uses a valueGetter (matched by object equality); Age uses colId 'myAgeCol'.
        await expect(agIdFor.cell('0', 'myAgeCol')).toContainText('23');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.headerCell('total')).toHaveCount(1);

        // Exclude removes the medal columns.
        await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
        await expect(agIdFor.headerCell('gold')).toHaveCount(0);
        await expect(agIdFor.headerCell('total')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'myAgeCol')).toContainText('23');

        // Include brings them back.
        await page.getByRole('button', { name: 'Include Medal Columns' }).click();
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Sort on the colId-matched Age column survives updates', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Age is matched by colId, so its sort state is retained across definition changes.
        await agIdFor.headerCell('myAgeCol').click();
        await expect(agIdFor.headerCell('myAgeCol')).toHaveAttribute('aria-sort', 'ascending');

        await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
        await page.getByRole('button', { name: 'Include Medal Columns' }).click();

        await expect(agIdFor.headerCell('myAgeCol')).toHaveAttribute('aria-sort', 'ascending');
    });
});
