import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Sort Athlete button applies and clears column state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Initial order: first data row is Natalie Coughlin (index 0).
        const natalie = agIdFor.rowNode('0');
        const aleksey = agIdFor.rowNode('1'); // Aleksey Nemov sorts first alphabetically
        await expect(natalie).toHaveAttribute('row-index', '0');

        await page.getByRole('button', { name: 'Sort Athlete' }).click();
        await expect(aleksey).toHaveAttribute('row-index', '0');
        await expect(natalie).not.toHaveAttribute('row-index', '0');

        await page.getByRole('button', { name: 'Clear All Sorting' }).click();
        await expect(natalie).toHaveAttribute('row-index', '0');
    });
});
