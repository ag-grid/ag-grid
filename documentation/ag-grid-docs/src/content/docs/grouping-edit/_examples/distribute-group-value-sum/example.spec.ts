import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by region then country. Sales uses aggFunc 'sum' with groupRowEditable and the
    // built-in distribution (precision 0). Editing a group's Sales total divides the new value
    // equally among its children. groupDefaultExpanded: -1 renders every group expanded.
    const europe = 'row-group-region-Europe';
    const france = 'row-group-region-Europe-country-France';

    test.eachFramework('group rows show the aggregated sum of their children', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // France = 120 + 80 = 200. Europe = France 200 + Germany 260 + Spain 160 = 620.
        await expect(agIdFor.cell(france, 'sales').first()).toHaveText('200');
        await expect(agIdFor.cell(europe, 'sales').first()).toHaveText('620');
    });

    test.eachFramework('editing a country group total distributes it uniformly', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit France's Sales total to 300. Uniform distribution splits it equally between the
        // two French leaf rows (fr-1, fr-2) = 150 each.
        const franceSales = agIdFor.cell(france, 'sales').first();
        await franceSales.dblclick();
        const editor = franceSales.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type('300');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Children share the new total; the group re-aggregates to 300.
        await expect(agIdFor.cell('fr-1', 'sales')).toHaveText('150');
        await expect(agIdFor.cell('fr-2', 'sales')).toHaveText('150');
        await expect(franceSales).toHaveText('300');

        // Europe rebalances to reflect the France change: 300 + 260 + 160 = 720.
        await expect(agIdFor.cell(europe, 'sales').first()).toHaveText('720');
    });
});
