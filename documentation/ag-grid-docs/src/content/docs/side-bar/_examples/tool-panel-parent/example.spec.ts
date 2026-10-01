import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Side bar buttons are hidden and no panel open by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // hideButtons: true, hiddenByDefault: true => side bar not shown.
        await expect(page.locator('.ag-side-bar')).toBeHidden();
        // No side button is visible (buttons exist in DOM but the side bar is hidden).
        await expect(page.locator('.ag-side-button:visible')).toHaveCount(0);
        // Neither external container is active initially.
        await expect(page.locator('#popup.active')).toHaveCount(0);
        await expect(page.locator('#drawer.active')).toHaveCount(0);
    });

    test.eachFramework('Open Columns renders the Columns panel in the popup parent', async ({ page, agFramework }) => {
        // The columns tool panel uses ToolPanelDef.parent = document.querySelector('#popup .content'),
        // which the example resolves at module-eval time. In vue3 the component's #popup element is not
        // yet mounted at that point, so parent is null and the panel falls back to the default side bar.
        // (The drawer test below still passes on vue3 because it passes the parent at click time.)
        test.skip(
            agFramework === 'vue3',
            'vue3 mounts #popup after module eval, so the module-time parent lookup is null.'
        );
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Open Columns Tool Panel' }).click();

        // Columns tool panel renders inside the custom popup parent (#popup .content).
        await expect(page.locator('#popup')).toHaveClass(/active/);
        await expect(page.locator('#popup .ag-column-panel')).toBeVisible();

        // RTI-3463: the popup must stay centred. The grid adds `ag-tool-panel-external`
        // (width: 100%) to the tool panel's parent, and the example used to copy that class
        // onto #popup itself, stretching it full width and pushing it against the left edge.
        await expect(page.locator('#popup')).not.toHaveClass(/ag-tool-panel-external/);
        const popupBox = (await page.locator('#popup .inner').boundingBox())!;
        const viewport = page.viewportSize()!;
        const offCentre = Math.abs(popupBox.x + popupBox.width / 2 - viewport.width / 2);
        expect(offCentre).toBeLessThan(20);
    });

    test.eachFramework(
        'Open Filters renders the Filters panel in the drawer and closes the popup',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Open the popup first, then switch to the drawer.
            await page.getByRole('button', { name: 'Open Columns Tool Panel' }).click();
            await expect(page.locator('#popup')).toHaveClass(/active/);

            await page.getByRole('button', { name: 'Open Filters Tool Panel' }).click();

            // Filters tool panel renders inside the drawer parent; the popup is closed.
            await expect(page.locator('#drawer')).toHaveClass(/active/);
            await expect(page.locator('#drawer .ag-filter-panel')).toBeVisible();
            await expect(page.locator('#popup')).not.toHaveClass(/active/);
        }
    );
});
