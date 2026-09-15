import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Side bar is hidden by default and toggled via setSideBarVisible', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar.hiddenByDefault = true => side bar not shown initially.
        await expect(page.locator('.ag-side-bar')).toBeHidden();

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        // Now visible, showing both configured tool panel buttons.
        await expect(page.locator('.ag-side-bar')).toBeVisible();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        await page.getByRole('button', { name: 'setSideBarVisible(false)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeHidden();
    });

    test.eachFramework('openToolPanel and closeToolPanel switch and close panels', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('columns')" }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('filters')" }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();

        // closeToolPanel closes the open panel, leaving no button selected (buttons remain).
        await page.getByRole('button', { name: 'closeToolPanel()' }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toHaveCount(0);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)')).toHaveCount(0);
    });

    test.eachFramework('setSideBarPosition moves the side bar left and right', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "setSideBarPosition('left')" }).click();
        await expect(page.locator('.ag-side-bar')).toHaveClass(/ag-side-bar-left/);

        await page.getByRole('button', { name: "setSideBarPosition('right')" }).click();
        await expect(page.locator('.ag-side-bar')).toHaveClass(/ag-side-bar-right/);
    });

    test.eachFramework('setSideBar resets the configured tool panels', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);

        // Reset to a single 'columns' panel.
        await page.getByRole('button', { name: "setSideBar('columns')" }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(1);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();

        // Reset to ['filters', 'columns'] => two panels, Filters first.
        await page.getByRole('button', { name: "setSideBar(['filters','columns'])" }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').first()).toContainText('Filters');
    });

    test.eachFramework('isSideBarVisible() logs the current visibility', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        const lastLog = (predicate: (l: string) => boolean) => logs.filter(predicate).slice(-1)[0];

        // sideBar.hiddenByDefault = true => isSideBarVisible() logs false.
        await page.getByRole('button', { name: 'isSideBarVisible()' }).click();
        await expect(() => {
            expect(lastLog((l) => l === 'true' || l === 'false')).toBe('false');
        }).toPass();

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: 'isSideBarVisible()' }).click();
        await expect(() => {
            expect(lastLog((l) => l === 'true' || l === 'false')).toBe('true');
        }).toPass();
    });

    test.eachFramework('getOpenedToolPanel() logs the opened panel id', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        const lastPanelLog = () => logs.filter((l) => l === 'columns' || l === 'filters' || l === 'null').slice(-1)[0];

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('columns')" }).click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();

        await page.getByRole('button', { name: 'getOpenedToolPanel()' }).click();
        await expect(() => {
            expect(lastPanelLog()).toBe('columns');
        }).toPass();

        await page.getByRole('button', { name: "openToolPanel('filters')" }).click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();

        await page.getByRole('button', { name: 'getOpenedToolPanel()' }).click();
        await expect(() => {
            expect(lastPanelLog()).toBe('filters');
        }).toPass();

        // With no panel open the API returns null.
        await page.getByRole('button', { name: 'closeToolPanel()' }).click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)')).toHaveCount(0);

        await page.getByRole('button', { name: 'getOpenedToolPanel()' }).click();
        await expect(() => {
            expect(lastPanelLog()).toBe('null');
        }).toPass();
    });

    test.eachFramework('getSideBar() returns the long form of a shortcut config', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        // The shortcut setSideBar('columns') is stored as the equivalent SideBarDef.
        await page.getByRole('button', { name: "setSideBar('columns')" }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(1);

        await page.getByRole('button', { name: 'getSideBar()' }).click();
        await expect(() => {
            // The example logs JSON.stringify(sideBar) and then the object itself; only the
            // former starts with a quoted key.
            const json = logs.filter((l) => l.startsWith('{"')).slice(-1)[0];
            expect(json).toBeDefined();
            // Expanded ToolPanelDef for the 'columns' shortcut, plus the derived defaultToolPanel.
            expect(json).toContain('"id":"columns"');
            expect(json).toContain('"labelDefault":"Columns"');
            expect(json).toContain('"labelKey":"columns"');
            expect(json).toContain('"iconKey":"columnsToolPanel"');
            expect(json).toContain('"toolPanel":"agColumnsToolPanel"');
            expect(json).toContain('"defaultToolPanel":"columns"');
        }).toPass();
    });

    test.eachFramework('onToolPanelVisibleChanged fires when a panel is opened', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('columns')" }).click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();

        await expect(() => {
            expect(logs.some((l) => l.includes('toolPanelVisibleChanged'))).toBe(true);
        }).toPass();
    });

    test.eachFramework('onToolPanelSizeChanged fires when a panel is resized', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await page.getByRole('button', { name: "openToolPanel('columns')" }).click();

        const openPanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(openPanel.locator('.ag-column-panel')).toBeVisible();

        // Drag the panel's horizontal resize bar (dragStartPixels is 1, so a few px is enough).
        const resizeBar = openPanel.locator('.ag-tool-panel-horizontal-resize');
        await expect(resizeBar).toBeVisible();
        const box = (await resizeBar.boundingBox())!;
        const y = box.y + box.height / 2;
        const x = box.x + box.width / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - 20, y, { steps: 5 });
        await page.mouse.move(x - 60, y, { steps: 5 });
        await page.mouse.up();

        await expect(() => {
            expect(logs.some((l) => l.includes('toolPanelSizeChanged'))).toBe(true);
        }).toPass();

        // The drag writes the new width onto the panel wrapper.
        await expect(async () => {
            const size = await openPanel.evaluate((el) => el.style.getPropertyValue('--ag-horizontal-size'));
            expect(size).not.toBe('');
        }).toPass();
    });
});
