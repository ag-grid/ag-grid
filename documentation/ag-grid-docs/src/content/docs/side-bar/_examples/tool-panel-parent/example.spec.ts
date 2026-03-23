import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns tool panel opens in popup', async ({ page }) => {
        const popup = page.locator('#popup');
        const popupContent = popup.locator('.content');

        // Wait for the grid to initialise (ensures module functions are available globally)
        await page.locator('.ag-header').waitFor({ state: 'visible' });

        // Popup is hidden by default
        await expect(popup).not.toBeVisible();

        // Click the button to open the columns tool panel in the popup
        await page.getByRole('button', { name: 'Open Columns Tool Panel' }).click();

        // Popup becomes visible and renders the columns tool panel inside it
        await expect(popup).toBeVisible();

        // Verify column items are displayed in the popup
        // aria-label format for leaf columns: "<DisplayName> Column"
        await expect(popupContent.locator('.ag-column-select-virtual-list-item[aria-label="Athlete Column"]')).toBeVisible();
        await expect(popupContent.locator('.ag-column-select-virtual-list-item[aria-label="Country Column"]')).toBeVisible();
        await expect(popupContent.locator('.ag-column-select-virtual-list-item[aria-label="Gold Column"]')).toBeVisible();
        await expect(popupContent.locator('.ag-column-select-virtual-list-item[aria-label="Silver Column"]')).toBeVisible();

        // Close the popup
        await popup.getByRole('button', { name: 'Close' }).click();
        await expect(popup).not.toBeVisible();
    });
});
