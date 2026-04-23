import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Full width rows render custom content', async ({ page }) => {
        await expect(page.locator('.notes-full-width-row').first()).toContainText('Usain Bolt');
        await expect(page.locator('.notes-full-width-row').nth(1)).toContainText('Allyson Felix');
    });

    test.eachFramework('Hovering a noted regular cell shows the note popup', async ({ page }) => {
        const athleteCell = page.locator('.ag-cell').filter({ hasText: 'Michael Phelps' }).first();
        await athleteCell.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue('This note belongs to a regular cell.');
    });

    test.eachFramework('Hovering a noted full width row shows the note popup', async ({ page }) => {
        const fullWidthRow = page
            .locator('.ag-row', { has: page.locator('.notes-full-width-row') })
            .filter({ hasText: 'Usain Bolt' })
            .first();
        await fullWidthRow.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'This note belongs to a full width row. The datasource receives location: fullWidthRow instead of a column.'
        );
    });

    test.eachFramework('Full width row notes open right-aligned instead of centred', async ({ page }) => {
        const fullWidthRow = page
            .locator('.ag-row', { has: page.locator('.notes-full-width-row') })
            .filter({ hasText: 'Usain Bolt' })
            .first();
        await fullWidthRow.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        const rowBox = await fullWidthRow.boundingBox();
        const popupBox = await popup.boundingBox();

        expect(rowBox).toBeTruthy();
        expect(popupBox).toBeTruthy();
        expect(Math.abs(rowBox!.x + rowBox!.width - (popupBox!.x + popupBox!.width))).toBeLessThanOrEqual(2);
    });
});
