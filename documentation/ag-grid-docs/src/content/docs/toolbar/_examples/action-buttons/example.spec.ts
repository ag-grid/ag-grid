import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Icon-only action buttons and separators render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator(':scope > .ag-toolbar-button-wrapper')).toHaveCount(7);
        await expect(toolbar.locator(':scope > .ag-toolbar-separator')).toHaveCount(3);
    });

    test.eachFramework('Action buttons have no visible label text', async ({ page }) => {
        await waitForGridContent(page);

        const buttons = page.locator('.ag-toolbar .ag-toolbar-button-wrapper .ag-toolbar-button');
        const count = await buttons.count();
        for (let i = 0; i < count; i++) {
            await expect(buttons.nth(i).locator('.ag-toolbar-button-label')).not.toBeVisible();
        }
    });

    test.eachFramework('Column chooser tabs directly to the element after the grid', async ({ page }) => {
        await waitForGridContent(page);

        await page.evaluate(() => {
            const after = document.createElement('button');
            after.id = 'focus-after-grid';
            after.textContent = 'After grid';
            document.querySelector('.ag-root-wrapper')!.after(after);
        });

        await page.locator('.ag-toolbar-button[title="Open Column Chooser"]').click();
        await expect(page.locator('.ag-dialog')).toBeVisible();

        await page.keyboard.press('Tab');
        await expect(page.locator('.ag-column-select-header-filter-wrapper input')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.locator('.ag-column-select-list .ag-virtual-list-item').first()).toBeFocused();
        await page.keyboard.press('Tab');

        await expect(page.locator('#focus-after-grid')).toBeFocused();
        await expect(page.locator('.ag-dialog > .ag-tab-guard-bottom')).not.toBeFocused();
    });

    // The grid horizontally virtualises, but all five columns fit once they have been sized, so
    // summing the rendered header cells is a complete total. Compared against the scrolling
    // container's clientWidth (the pattern used by column-sizing/continuous-auto-size-fit-grid-width).
    const totalColumnWidth = (page: any) =>
        page.evaluate(() =>
            [...document.querySelectorAll('.ag-header-cell[col-id]')].reduce(
                (sum, cell) => sum + cell.getBoundingClientRect().width,
                0
            )
        );
    const availableWidth = (page: any) =>
        page
            .locator('.ag-grid-scrolling-container')
            .first()
            .evaluate((el: HTMLElement) => el.clientWidth);
    const horizontalOverflow = (page: any) =>
        page
            .locator('.ag-grid-scrolling-container')
            .first()
            .evaluate((el: HTMLElement) => el.scrollWidth - el.clientWidth);

    test.eachFramework('Size Columns to Fit stretches the columns to fill the grid', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-button[title="Size Columns to Fit"]').click();

        // sizeColumnsToFit divides the available width between the columns, so their combined
        // width matches the viewport and nothing overflows horizontally.
        await expect(async () => {
            expect(Math.abs((await totalColumnWidth(page)) - (await availableWidth(page)))).toBeLessThanOrEqual(2);
        }).toPass();
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });

    test.eachFramework('Auto-size All Columns sizes the columns to their content', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const athleteWidth = async () => (await agIdFor.headerCell('athlete').boundingBox())!.width;

        // Start from the fitted widths so the change is unambiguous.
        await page.locator('.ag-toolbar-button[title="Size Columns to Fit"]').click();
        let fittedWidth = 0;
        await expect(async () => {
            fittedWidth = await athleteWidth();
            expect(Math.abs((await totalColumnWidth(page)) - (await availableWidth(page)))).toBeLessThanOrEqual(2);
        }).toPass();

        await page.locator('.ag-toolbar-button[title="Auto-size All Columns"]').click();

        // autoSizeAllColumns shrinks each column to its content, so the first column's width
        // changes and the columns no longer stretch across the whole viewport.
        await expect(async () => {
            expect(await athleteWidth()).not.toBe(fittedWidth);
            expect(await totalColumnWidth(page)).toBeLessThan((await availableWidth(page)) - 3);
        }).toPass();
    });

    test.eachFramework('Sort First Column Ascending sorts by athlete', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-button[title="Sort First Column Ascending"]').click();
        await waitForRowAnimations(page);

        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');

        // "Zivko Gocic" is the last athlete alphabetically, so it cannot be at the top ascending.
        await expectRowIdAtIndex(page, 0, '1148', { not: true });
    });

    test.eachFramework('Sort First Column Descending overrides the ascending sort', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-button[title="Sort First Column Ascending"]').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');

        // The second action button applies sort: 'desc' with defaultState: { sort: null }, so it
        // replaces the ascending sort rather than adding to it.
        await page.locator('.ag-toolbar-button[title="Sort First Column Descending"]').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'descending');

        // Data index 1148 is the first of the two "Zivko Gocic" rows, the alphabetical maximum.
        await expectRowIdAtIndex(page, 0, '1148');
    });

    test.eachFramework('Add Filter narrows the grid to Canada', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        await page.locator('.ag-toolbar-button[title="Add Filter"]').click();
        await waitForRowAnimations(page);

        // setFilterModel applies country contains "Canada". Data index 12 (Cindy Klassen) is the
        // first Canadian row, and the unfiltered first row drops out.
        await expect(agIdFor.cell('12', 'country')).toContainText('Canada');
        await expect(agIdFor.rowNode('0')).not.toBeVisible();
        await expect(page.locator('.ag-header-cell[col-id="country"] .ag-filter-active')).toBeVisible();
    });

    test.eachFramework('Clear All Filters restores the full row set', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-button[title="Add Filter"]').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('0')).not.toBeVisible();

        // setFilterModel(null) clears every column filter.
        await page.locator('.ag-toolbar-button[title="Clear All Filters"]').click();
        await waitForRowAnimations(page);

        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(page.locator('.ag-header-cell[col-id="country"] .ag-filter-active')).toBeHidden();
    });
});
