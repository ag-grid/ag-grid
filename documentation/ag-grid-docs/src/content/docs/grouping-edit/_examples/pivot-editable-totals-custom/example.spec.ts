import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Pivoted by product, grouped by region then country. Amount uses a custom groupRowValueSetter
    // (cascadeGroupTotal). Editing a pivot cell distributes the new total equally among only the
    // children matching that pivot key, leaving other pivot categories untouched.
    const electronics = 'pivot_product_Electronics_amount';
    const clothing = 'pivot_product_Clothing_amount';
    const europe = 'row-group-region-Europe';
    const france = 'row-group-region-Europe-country-France';

    test.eachFramework('pivot cells aggregate amounts per product category', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Europe Electronics = 120+150+80+140+95 = 585; Europe Clothing = 60+90+50+75+85 = 360.
        await expect(agIdFor.cell(europe, electronics).first()).toHaveText('585');
        await expect(agIdFor.cell(europe, clothing).first()).toHaveText('360');
        // France sells 120 of Electronics.
        await expect(agIdFor.cell(france, electronics).first()).toHaveText('120');
    });

    test.eachFramework('editing a pivot total distributes among matching children only', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Europe Electronics to 500. Distributed equally among the 5 European countries
        // that sell Electronics => 100 each; cascades to each country's single Electronics leaf.
        const europeElectronics = agIdFor.cell(europe, electronics).first();
        await europeElectronics.dblclick();
        const editor = europeElectronics.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type('500');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect(europeElectronics).toHaveText('500');

        // Every one of the five matching country groups receives an equal share (100),
        // not just France — a lopsided distribution summing to 500 would otherwise pass.
        await expect(agIdFor.cell(france, electronics).first()).toHaveText('100');
        await expect(agIdFor.cell('row-group-region-Europe-country-Germany', electronics).first()).toHaveText('100');
        await expect(agIdFor.cell('row-group-region-Europe-country-Spain', electronics).first()).toHaveText('100');
        await expect(agIdFor.cell('row-group-region-Europe-country-UK', electronics).first()).toHaveText('100');
        await expect(agIdFor.cell('row-group-region-Europe-country-Italy', electronics).first()).toHaveText('100');

        // The cascade reaches each country's single Electronics leaf.
        await expect(agIdFor.cell('eu-fr-elec', electronics).first()).toHaveText('100');
        await expect(agIdFor.cell('eu-de-elec', electronics).first()).toHaveText('100');

        // The Clothing pivot category is untouched by the Electronics edit.
        await expect(agIdFor.cell(europe, clothing).first()).toHaveText('360');
    });
});
