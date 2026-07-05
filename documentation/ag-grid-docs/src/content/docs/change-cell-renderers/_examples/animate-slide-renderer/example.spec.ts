import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Editable values render with thousands formatting', async ({ agIdFor }) => {
        // Row 0: a=5505, b=383, c=3148, d=0. Values use formatNumber (thousands separators).
        await expect(agIdFor.cell('0', 'a').first()).toContainText('5,505');
        await expect(agIdFor.cell('0', 'b').first()).toContainText('383');
        await expect(agIdFor.cell('0', 'c').first()).toContainText('3,148');
    });

    test.eachFramework('Editing a value slides the previous value out', async ({ agIdFor, page }) => {
        // The Total/Average columns use agAnimateSlideCellRenderer, which renders the
        // previous value in a fading slide-out element when the value changes.
        const cellA = agIdFor.cell('0', 'a').first();
        await cellA.dblclick();
        await page.keyboard.type('9999');
        await page.keyboard.press('Enter');

        await expect(agIdFor.cell('0', 'a').first()).toContainText('9,999');

        // The slide renderer adds the previous-value slide element on change.
        await expect(page.locator('.ag-value-slide-out').first()).toBeVisible();
    });
});
