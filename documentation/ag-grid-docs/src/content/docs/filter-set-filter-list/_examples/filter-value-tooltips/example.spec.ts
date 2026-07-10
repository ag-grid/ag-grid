import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

async function expandAndWait(agIdFor: any, page: any, colLabel: string) {
    await agIdFor.filterToolPanelGroupCollapsedIcon(colLabel).click();
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Enabled tooltips show the full value on hover', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Col B has showTooltips: true.
        await expandAndWait(agIdFor, page, 'Col B');
        const item = agIdFor.filterToolPanelGroup('Col B').locator('.ag-set-filter-item').nth(1);
        const value = (await item.innerText()).trim();
        await item.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText(value.slice(0, 8));
    });

    test.eachFramework('A custom tooltip component is used when supplied', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Col C has showTooltips: true plus a custom tooltip component.
        await expandAndWait(agIdFor, page, 'Col C');
        const item = agIdFor.filterToolPanelGroup('Col C').locator('.ag-set-filter-item').nth(1);
        await item.hover();

        await expect(page.locator('.custom-tooltip')).toContainText('Full value:');
    });
});
