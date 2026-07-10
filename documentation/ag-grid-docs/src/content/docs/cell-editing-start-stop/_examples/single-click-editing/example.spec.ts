import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Single click starts editing', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'athlete');

        // singleClickEdit=true: a single click starts editing (no double-click required)
        await cell.click();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();

        await page.keyboard.type('Fred');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('Fred');
    });
});
