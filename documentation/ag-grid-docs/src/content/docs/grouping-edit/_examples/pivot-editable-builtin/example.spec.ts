import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Editing a pivot group cell distributes among matching children', async ({ page, agIdFor }) => {
        // Pivoted by product, grouped by region/country. Editing a pivot cell on a group
        // row distributes the new total uniformly among the children matching that pivot key,
        // leaving other pivot categories untouched.
        const electronics = 'pivot_product_Electronics_amount';
        const clothing = 'pivot_product_Clothing_amount';
        const europe = 'row-group-region-Europe';
        const france = 'row-group-region-Europe-country-France';

        await waitForGridContent(page);

        // Aggregated pivot totals for Europe: Electronics = 120+150+80+140 = 490,
        // Clothing = 60+90+50+75 = 275.
        const europeElectronics = agIdFor.cell(europe, electronics).first();
        const europeClothing = agIdFor.cell(europe, clothing).first();
        await expect(europeElectronics).toHaveText('490');
        await expect(europeClothing).toHaveText('275');
        await expect(agIdFor.cell(france, electronics).first()).toHaveText('120');

        // Edit the Europe/Electronics pivot cell to 400. Uniform distribution divides it
        // equally among the 4 matching children (France, Germany, Spain, UK) = 100 each.
        await europeElectronics.dblclick();
        const editor = europeElectronics.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type('400');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Group total re-aggregates to the edited value; each matching child now shows 100.
        await expect(europeElectronics).toHaveText('400');
        await expect(agIdFor.cell(france, electronics).first()).toHaveText('100');

        // The Clothing pivot category is untouched by the Electronics edit.
        await expect(europeClothing).toHaveText('275');
    });
});
