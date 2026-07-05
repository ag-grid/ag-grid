import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom header renders focusable children and data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The country column uses a custom header with a button, input and link.
        const customHeader = agIdFor.headerCell('country').locator('.custom-header');
        await expect(customHeader).toContainText('Country', { useInnerText: true });
        await expect(customHeader.locator('button')).toBeVisible();
        await expect(customHeader.locator('input')).toBeVisible();
        await expect(customHeader.locator('a')).toBeVisible();

        // First data row is Michael Phelps (United States, age 23).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('Tab navigates between the custom header children', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const customHeader = agIdFor.headerCell('country').locator('.custom-header');
        const button = customHeader.locator('button');
        const input = customHeader.locator('input');
        const link = customHeader.locator('a');

        // Focus the first child, then tab through the remaining focusable children within the cell.
        await button.focus();
        await expect(button).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(input).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(link).toBeFocused();
    });
});
