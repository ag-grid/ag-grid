import type { Locator, Page } from 'playwright/test';

import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Grouped by region then segment. Amount uses aggFunc 'sum' with a custom groupRowValueSetter
    // (cascadeGroupTotal) that distributes a new total equally among children using the largest
    // remainder method, recursing through nested groups. groupDefaultExpanded: -1 expands all.
    const europe = 'row-group-region-Europe';
    const corporate = 'row-group-region-Europe-segment-Corporate';
    const enterprise = 'row-group-region-Europe-segment-Enterprise';

    const editGroupCell = async (page: Page, cell: Locator, value: string) => {
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.type(value);
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);
    };

    test.eachFramework('group rows show the summed amount of their children', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Europe/Corporate = 30+30+35+25+28+32+45+35 = 260. Europe = Corporate 260 + Enterprise 180 = 440.
        await expect(agIdFor.cell(corporate, 'amount').first()).toHaveText('260');
        await expect(agIdFor.cell(europe, 'amount').first()).toHaveText('440');
    });

    test.eachFramework('editing a segment total applies the largest remainder method', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Europe/Corporate to 803: 8 children, base = floor(803/8) = 100, remainder = 3.
        // The first three children (in data order) absorb one extra unit each (101); the rest
        // stay at the base value (100). A total that divides evenly would not exercise this.
        await editGroupCell(page, agIdFor.cell(corporate, 'amount').first(), '803');

        // First three Corporate leaves receive the remainder.
        await expect(agIdFor.cell('fr-paris', 'amount')).toHaveText('101');
        await expect(agIdFor.cell('fr-lyon', 'amount')).toHaveText('101');
        await expect(agIdFor.cell('de-berlin', 'amount')).toHaveText('101');
        // The remaining leaves receive the base value.
        await expect(agIdFor.cell('de-hamburg', 'amount')).toHaveText('100');
        await expect(agIdFor.cell('uk-manchester', 'amount')).toHaveText('100');

        // The group re-aggregates to the exact edited total (remainder preserved).
        await expect(agIdFor.cell(corporate, 'amount').first()).toHaveText('803');
        // Europe re-aggregates: 803 + Enterprise 180 = 983.
        await expect(agIdFor.cell(europe, 'amount').first()).toHaveText('983');
    });

    test.eachFramework('editing a region total cascades recursively through segments', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Europe to 400: its two segment children each receive 200, and each segment then
        // cascades to its own children. Corporate's 8 leaves => 25 each.
        await editGroupCell(page, agIdFor.cell(europe, 'amount').first(), '400');

        await expect(agIdFor.cell(europe, 'amount').first()).toHaveText('400');
        await expect(agIdFor.cell(corporate, 'amount').first()).toHaveText('200');
        await expect(agIdFor.cell(enterprise, 'amount').first()).toHaveText('200');
        await expect(agIdFor.cell('fr-paris', 'amount')).toHaveText('25');
    });
});
