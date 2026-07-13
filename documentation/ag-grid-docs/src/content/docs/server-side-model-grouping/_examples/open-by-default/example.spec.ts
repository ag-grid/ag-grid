import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'isServerSideGroupOpenByDefault auto-expands the configured routes on load',
        async ({ page }) => {
            await waitForGridContent(page);

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();

            // Route 'Zimbabwe' is opened by default — no click needed, its chevron is expanded.
            const zimbabwe = groupRow('Zimbabwe');
            await expect(zimbabwe).toBeVisible();
            await expect(zimbabwe.locator('.ag-group-expanded').first()).toBeVisible();

            // Route 'Zimbabwe,Swimming' is also opened by default — the Swimming subgroup under
            // Zimbabwe is expanded, revealing its lazy-loaded leaf rows (Zimbabwe only competes in
            // Swimming, and its two medal-winning years load automatically).
            const zimbabweSwimming = page.locator('.ag-row-level-1').filter({ hasText: 'Swimming' }).first();
            await expect(zimbabweSwimming.locator('.ag-group-expanded').first()).toBeVisible();
            const leaf2008 = page.locator('.ag-row-level-2').filter({ hasText: '2008' }).first();
            await expect(leaf2008).toBeVisible();
            await expect(leaf2008.locator('[col-id="gold"]')).toContainText('1');
            await expect(page.locator('.ag-row-level-2').filter({ hasText: '2004' }).first()).toBeVisible();

            // Routes not listed stay collapsed — United States is not opened by default.
            await expect(groupRow('United States').locator('.ag-group-contracted').first()).toBeVisible();
        }
    );
});
