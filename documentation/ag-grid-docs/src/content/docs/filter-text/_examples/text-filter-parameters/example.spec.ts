import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('caseSensitive on the Sport column only matches on exact case', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        await agIdFor.headerFilterButton('sport').click();
        const sportInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(sportInput).toBeVisible();

        // The sport filter is case-sensitive, so a lower-case term matches nothing.
        await sportInput.fill('swimming');
        await expect(page.locator('.ag-row')).toHaveCount(0);

        // The correctly-cased term matches.
        await sportInput.fill('Swimming');
        await expect(page.locator('[row-index="0"] [col-id="sport"]').first()).toContainText('Swimming');
    });

    test.eachFramework('trimInput on the Country column strips surrounding whitespace', async ({ page, agIdFor }) => {
        await agIdFor.headerFilterButton('country').click();
        const countryInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await expect(countryInput).toBeVisible();

        // Leading/trailing spaces are trimmed before matching, so this still matches "United States".
        await countryInput.fill('   United States   ');
        await expect(page.locator('[row-index="0"] [col-id="country"]').first()).toContainText('United States');
    });
});
