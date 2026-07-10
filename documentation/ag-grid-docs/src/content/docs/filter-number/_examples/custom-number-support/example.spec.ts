import { expect, test } from '@utils/grid/test-utils';

// Two columns both bound to `sale` (random data). colId 'sale' = default formatter (e.g. "123.45"),
// colId 'sale_1' = custom formatter/parser (comma decimals, $ prefix, e.g. "$123,45" / "-$45,20").
function toCustomFormat(defaultText: string): string {
    const commaDecimals = defaultText.replace('.', ',');
    if (commaDecimals.startsWith('-')) {
        return '-$' + commaDecimals.slice(1);
    }
    return '$' + commaDecimals;
}

test.agExample(import.meta, () => {
    test.eachFramework('Custom formatter renders $ and comma decimals', async ({ agIdFor }) => {
        const defaultText = (await agIdFor.cell('0', 'sale').innerText()).trim();
        // Default column uses toFixed(2), so it always has two decimals.
        expect(defaultText).toMatch(/^-?\d+\.\d{2}$/);

        await expect(agIdFor.cell('0', 'sale_1')).toHaveText(toCustomFormat(defaultText));
    });

    test.eachFramework('Custom numberParser filters using comma-decimal input', async ({ page, agIdFor }) => {
        // The row-0 value in comma-decimal form (custom input format), e.g. "123,45" or "-45,20".
        const defaultText = (await agIdFor.cell('0', 'sale').innerText()).trim();
        const commaInput = defaultText.replace('.', ',');
        const expectedCustom = toCustomFormat(defaultText);

        // Open the filter popup for the custom column. allowedCharPattern makes it a text input.
        await agIdFor.floatingFilterButton('sale_1').click();

        // Default option is 'equals'. Enter the value in the custom comma-decimal format;
        // the numberParser converts "123,45" into 123.45.
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(filterInput).toBeVisible();
        await filterInput.fill(commaInput);

        // close the filter popup
        await agIdFor.cell('0', 'sale_1').click();

        // Row 0 still matches (parser turned the comma-decimal input back into a number).
        await expect(agIdFor.cell('0', 'sale_1')).toHaveText(expectedCustom);

        // Equals on a single value leaves only rows sharing that value. The data is random, so
        // rather than assume a specific row is filtered out, assert every remaining custom cell
        // shows the filtered value — the invariant that holds however many rows happen to match.
        const visibleCustomCells = page.locator('[data-testid^="ag-cell:"][data-testid*="colId=sale_1"]');
        await expect(visibleCustomCells.first()).toBeVisible();
        // Retry until the row set settles (filtering leaves briefly-lingering rows mid-animation),
        // then require every remaining custom cell to show the filtered value.
        await expect(async () => {
            const texts = await visibleCustomCells.allInnerTexts();
            expect(texts.length).toBeGreaterThan(0);
            for (const text of texts) {
                expect(text.trim()).toBe(expectedCustom);
            }
        }).toPass();
    });
});
