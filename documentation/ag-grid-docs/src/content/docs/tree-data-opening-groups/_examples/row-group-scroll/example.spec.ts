import { clickGroupValue, expandGroups, expect, groupRow, test } from '@utils/grid/test-utils';

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
        await expandGroups(page, ['Documents', 'Work', 'Personal']);

        // Record scroll position before expanding Downloads
        const scrollBefore = await viewport.evaluate((el) => el.scrollTop);

        // Expand Downloads (near the bottom) - the onRowGroupOpened handler
        // calls ensureIndexVisible to scroll so all children are visible
        await groupRow(page, 'Downloads').locator('.ag-group-contracted').click();

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

    // The date and number filters each need their own module registered; without it the popup throws on
    // open instead of appearing. The columns name their filters, so every framework gets the same one.
    test.eachFramework('date filters open and filter the tree', async ({ agIdFor, page }) => {
        const groupValues = page.locator('.ag-group-value');

        await agIdFor.headerFilterButton('modified').click();
        await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
        await clickGroupValue(page, 'Documents'); // closes the popup - a surviving group is a stable target

        await agIdFor.headerFilterButton('created').click();
        const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(createdFilter).toBeVisible();

        // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
        await createdFilter.fill('2023-06-22');
        await createdFilter.dispatchEvent('input');
        await clickGroupValue(page, 'Documents');

        // Desktop holds no match, so its disappearance marks the filter as applied.
        await expect(groupValues.filter({ hasText: 'Desktop' })).toHaveCount(0);
        await expandGroups(page, ['Documents', 'Work', 'ProjectBeta']);

        // Tree data keeps a matching leaf's whole ancestor path, though no group has a `created` of its own.
        await expect(page.locator('.ag-row')).toHaveCount(4);
        await expect(groupValues.filter({ hasText: 'Report.pdf' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Budget.xlsx' })).toHaveCount(0); // ProjectBeta's other child
    });

    test.eachFramework('the number filter on size filters the tree', async ({ agIdFor, page }) => {
        const groupValues = page.locator('.ag-group-value');

        await agIdFor.headerFilterButton('size').click();
        const sizeFilter = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(sizeFilter).toBeVisible();

        // MeetingNotes_August.pdf is the only row this size, and no group's `sum` aggregation matches it.
        await sizeFilter.fill('460800');
        await sizeFilter.dispatchEvent('input');
        await clickGroupValue(page, 'Desktop');

        await expect(groupValues.filter({ hasText: 'Documents' })).toHaveCount(0);
        await expandGroups(page, ['Desktop']);

        await expect(page.locator('.ag-row')).toHaveCount(2);
        await expect(groupValues.filter({ hasText: 'MeetingNotes_August.pdf' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'ToDoList.txt' })).toHaveCount(0); // Desktop's other child
    });
});
