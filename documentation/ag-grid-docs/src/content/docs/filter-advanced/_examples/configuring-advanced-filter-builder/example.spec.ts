import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should open builder via external button', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Builder should not be visible initially
        const builderDialog = page.locator('.ag-advanced-filter-builder');
        await expect(builderDialog).not.toBeVisible();

        // Click the "Advanced Filter Builder" button
        await page.getByText('Advanced Filter Builder').click();

        // Builder should now be visible
        await expect(builderDialog).toBeVisible();
    });

    test.eachFramework('should disable button while builder is open', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const builderButton = page.getByText('Advanced Filter Builder');

        // Button should be enabled initially
        await expect(builderButton).toBeEnabled();

        // Open builder
        await builderButton.click();

        // Button should be disabled while builder is open
        await expect(builderButton).toBeDisabled();

        // Close builder via Cancel
        const cancelButton = page.locator('.ag-advanced-filter-builder').getByText('Cancel');
        await cancelButton.click();

        // Button should be enabled again
        await expect(builderButton).toBeEnabled();
    });

    test.eachFramework('should show move buttons in builder (showMoveButtons param)', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Open builder
        await page.getByText('Advanced Filter Builder').click();
        const builderDialog = page.locator('.ag-advanced-filter-builder');
        await expect(builderDialog).toBeVisible();

        // Move buttons should be visible (showMoveButtons: true).
        // They have the icon classes ag-icon-up and ag-icon-down inside the button items.
        const moveUpIcons = builderDialog.locator('.ag-icon-up');
        const moveDownIcons = builderDialog.locator('.ag-icon-down');
        const moveIconCount = (await moveUpIcons.count()) + (await moveDownIcons.count());
        expect(moveIconCount).toBeGreaterThan(0);
    });
});
