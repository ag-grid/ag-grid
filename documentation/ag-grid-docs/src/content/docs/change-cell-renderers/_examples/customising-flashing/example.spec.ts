import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders seeded row values', async ({ agIdFor }) => {
        // Row 0: a=5505, b=383, c=3148, d=e=f=0.
        await expect(agIdFor.cell('0', 'a').first()).toContainText('5505');
        await expect(agIdFor.cell('0', 'c').first()).toContainText('3148');
        await expect(agIdFor.cell('0', 'd').first()).toContainText('0');
    });

    test.eachFramework('Updating data flashes changed cells', async ({ agIdFor, page }) => {
        // All columns have enableCellChangeFlash. Clicking the button updates 20 cells,
        // which flash via the ag-cell-data-changed class (custom highlight colour).
        await expect(agIdFor.cell('0', 'a').first()).toBeVisible();
        await page.getByRole('button', { name: 'Update Some Data' }).click();

        const flashed = page.locator('.ag-cell-data-changed, .ag-cell-data-changed-animation');
        await expect(flashed.first()).toBeVisible({ timeout: 5000 });
    });
});
