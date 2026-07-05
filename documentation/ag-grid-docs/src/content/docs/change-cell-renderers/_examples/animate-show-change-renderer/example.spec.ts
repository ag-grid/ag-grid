import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Editable values render with thousands formatting', async ({ agIdFor }) => {
        // Row 0: a=5505, b=383, c=3148, d=0. Values use formatNumber (thousands separators).
        await expect(agIdFor.cell('0', 'a').first()).toContainText('5,505');
        await expect(agIdFor.cell('0', 'b').first()).toContainText('383');
        await expect(agIdFor.cell('0', 'c').first()).toContainText('3,148');
    });

    test.eachFramework('Editing a value animates the derived columns', async ({ agIdFor, page }) => {
        // The Total/Average columns use agAnimateShowChangeCellRenderer, which renders a
        // delta element (green up / red down) beside the new value when it changes.
        const cellA = agIdFor.cell('0', 'a').first();
        await cellA.dblclick();
        await page.keyboard.type('9999');
        await page.keyboard.press('Enter');

        await expect(agIdFor.cell('0', 'a').first()).toContainText('9,999');

        // Increasing 'a' pushes Total/Average up, so a delta appears.
        await expect(page.locator('.ag-value-change-delta').first()).toBeVisible();
    });
});
