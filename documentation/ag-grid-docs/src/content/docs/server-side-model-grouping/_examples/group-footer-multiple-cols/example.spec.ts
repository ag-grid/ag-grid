import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'groupTotalRow bottom renders footers across separate per-level group columns',
        async ({ page }) => {
            await waitForGridContent(page);

            // groupDisplayType: 'multipleColumns' gives one auto group column per level.
            await expect(page.locator('[col-id="ag-Grid-AutoColumn-country"]').first()).toBeVisible();
            await expect(page.locator('[col-id="ag-Grid-AutoColumn-sport"]').first()).toBeVisible();

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();
            await expect(groupRow('United States')).toBeVisible();

            // Expanding a country lazy-loads its Sport subgroups; groupTotalRow: 'bottom' appends a
            // footer after the group's children.
            await groupRow('United States').locator('.ag-group-contracted').first().click();
            await expect(groupRow('Swimming')).toBeVisible();

            // The footer sits below all 40 US sports — scroll it into the rendered range.
            await page.evaluate(() => {
                const vp = document.querySelector('.ag-body-viewport') as HTMLElement;
                if (vp) {
                    vp.scrollTop = 1700;
                }
            });

            // The top-level footer's "Total <country>" lands in the country group column, the sport
            // group column is a separate (empty) cell, and the aggregated medals follow.
            const footer = page.locator('.ag-row-footer').filter({ hasText: 'Total United States' }).first();
            await expect(footer.locator('[col-id="ag-Grid-AutoColumn-country"]')).toContainText('Total United States');
            await expect(footer.locator('[col-id="ag-Grid-AutoColumn-sport"]')).toHaveText('');
            await expect(footer.locator('[col-id="gold"]')).toContainText('552');
            await expect(footer.locator('[col-id="silver"]')).toContainText('440');
            await expect(footer.locator('[col-id="bronze"]')).toContainText('320');
        }
    );
});
