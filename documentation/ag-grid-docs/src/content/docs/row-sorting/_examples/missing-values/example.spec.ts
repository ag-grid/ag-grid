import {
    ensureGridReady,
    expect,
    orderedValues,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

async function expectOrder(page: Page, expected: string[]) {
    await expect(async () => {
        expect(await orderedValues(page, 'description')).toEqual(expected);
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('Last places missing values last in both directions', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sortMissingValues: 'last' and ascending on load. NaN sorts after numbers; missing values keep the row data order.
        await expectOrder(page, ['-2', '0', '5', '7', 'NaN', 'undefined', 'null']);

        await agIdFor.headerCell('amount').click();
        await waitForRowAnimations(page);
        await expectOrder(page, ['NaN', '7', '5', '0', '-2', 'undefined', 'null']);
    });

    test.eachFramework('First places missing values first in both directions', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'First', exact: true }).click();
        await waitForRowAnimations(page);
        await expectOrder(page, ['undefined', 'null', '-2', '0', '5', '7', 'NaN']);

        await agIdFor.headerCell('amount').click();
        await waitForRowAnimations(page);
        await expectOrder(page, ['undefined', 'null', 'NaN', '7', '5', '0', '-2']);
    });

    test.eachFramework('In Order sorts missing values as the smallest values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Missing values are equal to each other, so they keep the row data order: undefined, then null.
        await page.getByRole('button', { name: 'In Order', exact: true }).click();
        await waitForRowAnimations(page);
        await expectOrder(page, ['undefined', 'null', '-2', '0', '5', '7', 'NaN']);

        await agIdFor.headerCell('amount').click();
        await waitForRowAnimations(page);
        await expectOrder(page, ['NaN', '7', '5', '0', '-2', 'undefined', 'null']);
    });
});
