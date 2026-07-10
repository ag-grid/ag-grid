import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Slice-and-dice grid starts grouped Country -> Year with aggregated medal totals',
        async ({ page }) => {
            await waitForGridContent(page);

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();

            // Grid opens grouped by Country, with server-side summed medal totals.
            await expect(groupRow('United States')).toBeVisible();
            await expect(groupRow('United States').locator('[col-id="gold"]')).toContainText('552');
            await expect(groupRow('United States').locator('[col-id="silver"]')).toContainText('440');
            await expect(groupRow('United States').locator('[col-id="bronze"]')).toContainText('320');

            // Expanding a Country lazy-loads the second group level (Year) with its own aggregated totals.
            await groupRow('United States').locator('.ag-group-contracted').first().click();
            await expect(groupRow('United States').locator('.ag-group-expanded').first()).toBeVisible();
            await expect(groupRow('2000')).toBeVisible();
            await expect(groupRow('2000').locator('[col-id="gold"]')).toContainText('130');
            await expect(groupRow('2000').locator('[col-id="silver"]')).toContainText('61');
            await expect(groupRow('2000').locator('[col-id="bronze"]')).toContainText('52');
        }
    );
});
