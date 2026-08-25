import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Default side bar shows Columns and Filters with Columns open', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar: true => default side bar with Columns and Filters tool panels.
        const sideButtons = page.locator('.ag-side-button');
        await expect(sideButtons).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        // Columns panel is open by default.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
    });

    test.eachFramework('Clicking Filters button opens the Filters panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-side-button').filter({ hasText: 'Filters' }).click();

        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toHaveCount(0);
    });

    test.eachFramework('Header row follows the viewport width when the side bar is resized', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Flex columns would resize the header row via their own recalculation, masking the bug: with
        // no displayed columns the header row width depends only on the measured viewport width.
        await page.locator('.ag-column-select-header-checkbox').click();
        await expect(page.locator('.ag-header-cell')).toHaveCount(0);

        const viewport = page.locator('.ag-grid-viewport').first();
        const headerRow = page.locator('.ag-header-row').first();
        const rootWrapper = page.locator('.ag-root-wrapper').first();

        let initialViewportWidth = 0;
        let initialRootWidth = 0;
        await expect(async () => {
            const viewportBox = await viewport.boundingBox();
            const headerBox = await headerRow.boundingBox();
            const rootBox = await rootWrapper.boundingBox();
            expect(viewportBox!.width).toBeGreaterThan(0);
            expect(headerBox!.width).toBeCloseTo(viewportBox!.width, 0);
            initialViewportWidth = viewportBox!.width;
            initialRootWidth = rootBox!.width;
        }).toPass();

        // Drag the side bar's resize gutter towards the grid's right edge to narrow the side bar,
        // which widens the viewport while the grid root stays the same size.
        const gutter = page.locator('.ag-tool-panel-horizontal-resize').first();
        const gutterBox = (await gutter.boundingBox())!;
        const startX = gutterBox.x + gutterBox.width / 2;
        const startY = gutterBox.y + gutterBox.height / 2;
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        for (const offset of [5, 20, 40, 60]) {
            await page.mouse.move(startX + offset, startY);
        }
        await page.mouse.up();

        await expect(async () => {
            const viewportBox = await viewport.boundingBox();
            const headerBox = await headerRow.boundingBox();
            const rootBox = await rootWrapper.boundingBox();
            // The drag must actually have resized the side bar, otherwise the width assertion below
            // would pass trivially.
            expect(Math.abs(viewportBox!.width - initialViewportWidth)).toBeGreaterThan(10);
            expect(headerBox!.width).toBeCloseTo(viewportBox!.width, 0);
            // A side bar resize does not change the size of the grid itself.
            expect(rootBox!.width).toBeCloseTo(initialRootWidth, 0);
        }).toPass();
    });
});
