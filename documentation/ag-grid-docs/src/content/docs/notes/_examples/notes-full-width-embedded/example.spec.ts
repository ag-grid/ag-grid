import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Embedded full width rows render left, centre and right sections', async ({ page }) => {
        await expect(page.locator('.notes-full-width-row--left').first()).toContainText('Usain Bolt');
        await expect(page.locator('.notes-full-width-row--center').first()).toContainText('Usain Bolt');
        await expect(page.locator('.notes-full-width-row--right').first()).toContainText('Usain Bolt');
    });

    test.eachFramework('Hovering the left embedded full width section shows the left note', async ({ page }) => {
        await page.locator('.notes-full-width-row--left').first().hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to the left embedded full width section.'
        );
    });

    test.eachFramework('Hovering the centre embedded full width section shows the centre note', async ({ page }) => {
        await page.locator('.notes-full-width-row--center').first().hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to the centre embedded full width section.'
        );
    });

    test.eachFramework('Hovering the right embedded full width section shows the right note', async ({ page }) => {
        await page.locator('.notes-full-width-row--right').first().hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to the right embedded full width section.'
        );
    });

    test.eachFramework('Switching between embedded full width sections keeps a single popup open', async ({ page }) => {
        await page.locator('.notes-full-width-row--left').first().hover();
        await expect(page.locator('.ag-notes-popup')).toHaveCount(1);

        await page.locator('.notes-full-width-row--center').first().hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toHaveCount(1);
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to the centre embedded full width section.'
        );
    });
});
