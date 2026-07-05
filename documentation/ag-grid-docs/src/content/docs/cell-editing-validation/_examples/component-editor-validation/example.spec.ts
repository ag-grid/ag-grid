import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0 from data.ts: Alice Johnson, (415) 555-1234.
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'name')).toContainText('Alice Johnson');
        await expect(agIdFor.cell('0', 'phone')).toContainText('(415) 555-1234');
    });

    test.eachFramework('custom phone editor commits a well-formatted number', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'phone');
        await cell.dblclick();

        const input = page.locator('input.phone-cell-editor');
        await expect(input).toBeVisible();
        await input.fill('(999) 555-0000');
        await input.press('Enter');

        await expect(cell).toContainText('(999) 555-0000');
    });

    test.eachFramework('custom phone editor reverts an invalid number', async ({ agIdFor, page }) => {
        // The phone editor validates against a strict (123) 456-7890 pattern.
        // '123' is invalid, so the default revert mode discards it back to the original value.
        const cell = agIdFor.cell('0', 'phone');
        await cell.dblclick();

        const input = page.locator('input.phone-cell-editor');
        await expect(input).toBeVisible();
        await input.fill('123');
        await input.press('Enter');

        await expect(cell).toContainText('(415) 555-1234');
    });
});
