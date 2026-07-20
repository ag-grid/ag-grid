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

    test.eachFramework('editing a segment total distributes equally to leaf rows', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Edit Europe/Corporate to 800: 8 children => 100 each (largest remainder, no remainder).
        await editGroupCell(page, agIdFor.cell(corporate, 'amount').first(), '800');

        await expect(agIdFor.cell('fr-paris', 'amount')).toHaveText('100');
        await expect(agIdFor.cell(corporate, 'amount').first()).toHaveText('800');
        // Europe re-aggregates: 800 + Enterprise 180 = 980.
        await expect(agIdFor.cell(europe, 'amount').first()).toHaveText('980');
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
