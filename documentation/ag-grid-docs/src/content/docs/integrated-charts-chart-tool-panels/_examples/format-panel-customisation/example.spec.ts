import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The Customize (format) panel groups are reordered, the Horizontal Axis group is open by default,
    // the Title and Legend groups are omitted, and the panel is open by default via
    // `defaultToolPanel: 'format'`.
    test.eachFramework('Customize panel reorders groups and omits Title/Legend', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Customize (format) panel is active by default.
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Customize');
        const formatWrapper = page.locator('.ag-chart-format-wrapper');
        await expect(formatWrapper).toBeVisible();

        const topLevelTitle = (title: string) =>
            formatWrapper.locator('.ag-charts-format-top-level-group-title', { hasText: title });

        // The configured groups are present.
        await expect(topLevelTitle('Series')).toBeVisible();
        await expect(topLevelTitle('Chart Style')).toBeVisible();
        await expect(topLevelTitle('Horizontal Axis')).toBeVisible();
        await expect(topLevelTitle('Vertical Axis')).toBeVisible();

        // The Title and Legend groups have been omitted.
        await expect(topLevelTitle('Titles')).toHaveCount(0);
        await expect(topLevelTitle('Legend')).toHaveCount(0);

        const groupByTitle = (title: string) =>
            formatWrapper
                .locator('.ag-charts-format-top-level-group')
                .filter({ has: page.locator('.ag-charts-format-top-level-group-title', { hasText: title }) });

        // The Horizontal Axis group is open by default (its container is displayed)...
        await expect(
            groupByTitle('Horizontal Axis').locator('.ag-charts-format-top-level-group-container').first()
        ).toBeVisible();

        // ...while a group left closed (Series) has its container hidden.
        const seriesContainer = groupByTitle('Series').locator('.ag-charts-format-top-level-group-container').first();
        await expect(seriesContainer).not.toBeVisible();

        // Expanding the Series group shows its container.
        await groupByTitle('Series').locator('.ag-charts-format-top-level-group-title').first().click();
        await expect(seriesContainer).toBeVisible();
    });
});
