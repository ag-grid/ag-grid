import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('buttons show the column menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // showColumnMenu('age') opens the age column menu
        await page.locator('button', { hasText: 'Show Age Column Menu' }).click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});
