import { expect, test } from '@utils/grid/test-utils';

// Data: olympic-winners.json. Row 0 = Michael Phelps (United States), row 4 = Aleksey Nemov (Russia).

test.agExample(import.meta, () => {
    test.eachFramework('Each column shows its configured filter placeholder', async ({ agIdFor, page }) => {
        // Athlete: no configuration, default placeholder.
        await agIdFor.headerFilterButton('athlete').click();
        await expect(page.getByPlaceholder('Filter...').first()).toBeVisible();

        // Country: static string placeholder.
        await agIdFor.headerFilterButton('country').click();
        await expect(page.getByPlaceholder('Country...').first()).toBeVisible();

        // Sport: function using filterOptionKey + default placeholder.
        await agIdFor.headerFilterButton('sport').click();
        await expect(page.getByPlaceholder('contains - Filter...').first()).toBeVisible();

        // Total: function using the filter option display name.
        await agIdFor.headerFilterButton('total').click();
        await expect(page.getByPlaceholder('Equals total').first()).toBeVisible();
    });

    test.eachFramework('Filtering via the placeholder input filters the grid', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('4', 'country')).toContainText('Russia');

        await agIdFor.headerFilterButton('country').click();
        await page.getByPlaceholder('Country...').first().fill('United States');

        // Contains 'United States' keeps row 0, drops the Russia row (row 4).
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('4', 'country')).not.toBeVisible();
    });
});
