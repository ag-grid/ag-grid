import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Medal columns can be excluded and included again', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // All columns present initially, including the medal columns.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.headerCell('total')).toHaveCount(1);

        // Exclude removes gold/silver/bronze/total, leaving the rest.
        await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
        await expect(agIdFor.headerCell('gold')).toHaveCount(0);
        await expect(agIdFor.headerCell('silver')).toHaveCount(0);
        await expect(agIdFor.headerCell('bronze')).toHaveCount(0);
        await expect(agIdFor.headerCell('total')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Include brings them back.
        await page.getByRole('button', { name: 'Include Medal Columns' }).click();
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.headerCell('total')).toHaveCount(1);
    });

    test.eachFramework('Country sort is retained across column changes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Sort by country, then toggle the medal columns off and on.
        await agIdFor.headerCell('country').click();
        await expect(agIdFor.headerCell('country')).toHaveAttribute('aria-sort', 'ascending');

        await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
        await page.getByRole('button', { name: 'Include Medal Columns' }).click();

        // The kept column retains its sort state across the definition changes.
        await expect(agIdFor.headerCell('country')).toHaveAttribute('aria-sort', 'ascending');
    });
});
