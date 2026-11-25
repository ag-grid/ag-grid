import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pagination focus renders custom control params', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.getByLabel('Use custom component', { exact: true }).check();

        const nextPage = page.getByRole('button', { name: 'Next Page', exact: true });
        const tooltip = page.locator('[role="tooltip"]:not(.ag-tooltip-hiding)');
        await nextPage.focus();
        await expect(nextPage).toBeFocused();
        await expect(tooltip).toContainText('Grid control');
        await expect(tooltip).toContainText('Go to next page');
        await expect(tooltip).toContainText('pagination / nextPage');

        await nextPage.click();
        await expect(agIdFor.cell('3', 'athlete')).toContainText('Usain Bolt');
    });

    test.eachFramework('Sidebar focus uses its configured tooltip rather than its label', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.getByLabel('Use custom component', { exact: true }).check();

        const columnsTab = page.getByRole('tab', { name: 'Columns', exact: true });
        await columnsTab.focus();
        await expect(columnsTab).toHaveAccessibleName('Columns');
        const tooltip = page.locator('[role="tooltip"]:not(.ag-tooltip-hiding)');
        await expect(tooltip).toContainText('Configure columns');
        await expect(tooltip).toContainText('sideBar / toolPanel');

        await columnsTab.click();
        await expect(columnsTab).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('.ag-column-select')).toBeVisible();
    });

    test.eachFramework('Nested header controls replace the enclosing header tooltip', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.getByLabel('Use custom component', { exact: true }).check();

        const header = agIdFor.headerCell('athlete');
        const tooltip = page.locator('[role="tooltip"]:not(.ag-tooltip-hiding)');
        await header.locator('.ag-header-cell-text').hover();
        await expect(tooltip).toHaveText('Athlete');

        await header.locator('.ag-header-cell-menu-button').hover();
        await expect(tooltip).toContainText('Open column menu');
        await expect(tooltip).toContainText('header / columnMenu');
        await expect(tooltip).toHaveCount(1);
    });

    test.eachFramework('Custom rendering replaces the default component when enabled', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const nextPage = page.getByRole('button', { name: 'Next Page', exact: true });
        const tooltip = page.locator('[role="tooltip"]:not(.ag-tooltip-hiding)');
        await expect(page.getByLabel('Use custom component', { exact: true })).not.toBeChecked();
        await nextPage.focus();
        await expect(tooltip).toHaveText('Go to next page');
        await expect(page.locator('.control-tooltip')).toHaveCount(0);

        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);

        await page.getByLabel('Use custom component', { exact: true }).check();
        await nextPage.focus();
        await expect(tooltip).toContainText('pagination / nextPage');
        await expect(page.locator('.control-tooltip')).toHaveCount(1);
    });

    test.eachFramework(
        'Suppression hides controls but preserves ordinary header tooltips',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await page.clock.install();

            await page.getByLabel('Suppress built-in tooltips', { exact: true }).check();
            const nextPage = page.getByRole('button', { name: 'Next Page', exact: true });
            await nextPage.hover();
            await nextPage.focus();
            await page.clock.runFor(2500);
            const tooltip = page.locator('[role="tooltip"]:not(.ag-tooltip-hiding)');
            await expect(tooltip).toHaveCount(0);

            await agIdFor.headerCell('athlete').locator('.ag-header-cell-text').hover();
            await expect(tooltip).toHaveText('Athlete');

            await page.getByLabel('Suppress built-in tooltips', { exact: true }).uncheck();
            await nextPage.focus();
            await expect(tooltip).toContainText('Go to next page');
        }
    );
});
