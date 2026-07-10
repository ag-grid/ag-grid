import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'groupHideOpenParents hides an expanded group row and restores it on collapse',
        async ({ page }) => {
            await waitForGridContent(page);

            // Before expanding, United States is a top-level (level-0) group row of its own.
            const usTopLevel = () =>
                page
                    .locator('.ag-row-level-0')
                    .filter({ has: page.locator('.ag-group-value', { hasText: 'United States' }) })
                    .first();
            await expect(usTopLevel()).toBeVisible();
            await expect(usTopLevel().locator('.ag-group-contracted').first()).toBeVisible();

            // Expand United States.
            await usTopLevel().locator('.ag-group-contracted').first().click();

            // groupHideOpenParents: the open United States group row is removed and its first child
            // (the Swimming sport group) takes its place, carrying the open parent's "United States"
            // context in the same group cell alongside the child's own value and aggregates.
            const firstChild = page.locator('.ag-row-level-1').filter({ hasText: 'Swimming' }).first();
            await expect(firstChild).toBeVisible();
            await expect(firstChild).toContainText('United States');
            await expect(firstChild).toContainText('Swimming');
            await expect(firstChild.locator('[col-id="gold"]')).toContainText('139');
            // The standalone level-0 United States group row is no longer displayed.
            await expect(
                page
                    .locator('.ag-row-level-0')
                    .filter({ has: page.locator('.ag-group-value', { hasText: 'United States' }) })
            ).toHaveCount(0);

            // Collapsing (via the open parent's expanded chevron) restores the level-0 group row.
            await firstChild.locator('.ag-group-expanded').first().click();
            await expect(usTopLevel()).toBeVisible();
            await expect(usTopLevel().locator('.ag-group-contracted').first()).toBeVisible();
            await expect(page.locator('.ag-row-level-1').filter({ hasText: 'Swimming' })).toHaveCount(0);
        }
    );
});
