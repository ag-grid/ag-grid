import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const viewport = page.locator('.ag-grid-viewport');
        const groupValues = page.locator('.ag-group-value');

        // Shrink the viewport so that not all rows fit after expanding groups
        await page.setViewportSize({ width: 1280, height: 300 });

        // No groupDefaultExpanded, all groups collapsed initially
        await expect(groupValues.filter({ hasText: 'Desktop' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Documents' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Downloads' }).first()).toBeVisible();

        // Children should not be visible (groups collapsed)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' })).toHaveCount(0);

        // Expand Documents to create more rows, pushing Downloads further down
        const findGroupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        await findGroupRow('Documents').locator('.ag-group-contracted').click();
        await findGroupRow('Work').locator('.ag-group-contracted').click();
        await findGroupRow('Personal').locator('.ag-group-contracted').click();

        // Record scroll position before expanding Downloads
        const scrollBefore = await viewport.evaluate((el) => el.scrollTop);

        // Expand Downloads (near the bottom) - the onRowGroupOpened handler
        // calls ensureIndexVisible to scroll so all children are visible
        await findGroupRow('Downloads').locator('.ag-group-contracted').click();

        // Verify Downloads' children are visible (scroll-to-children behaviour)
        await expect(agIdFor.autoGroupCell('22')).toContainText('SoftwareInstaller.exe', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('23')).toContainText('Receipt_OnlineStore.pdf', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('24')).toContainText('Ebook.pdf', { useInnerText: true });

        // Verify the grid actually scrolled to reveal the children
        const scrollAfter = await viewport.evaluate((el) => el.scrollTop);
        expect(scrollAfter).toBeGreaterThan(scrollBefore);
    });
});
