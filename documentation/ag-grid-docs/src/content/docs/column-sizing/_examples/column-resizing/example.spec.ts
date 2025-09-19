import { expect, test } from '@utils/grid/test-utils';
import type { Locator } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number | undefined> {
    return (await locator.boundingBox())?.width;
}

test.agExample(import.meta, () => {
    test.eachFramework('fitCellToContents', async ({ page, agIdFor }) => {
        expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(150);
        expect(await getWidth(agIdFor.headerCell('age'))).toEqual(142);
        expect(await getWidth(agIdFor.headerCell('country'))).toEqual(137);
        expect(await getWidth(agIdFor.headerCell('year'))).toEqual(86);
        expect(await getWidth(agIdFor.headerCell('date'))).toEqual(130);

        expect(await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))).toEqual(
            645
        );

        // API call doesn't use defaultMaxWidth so we expect a larger column
        await page.locator('button.resize-button').click();
        expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(185);
        expect(await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))).toEqual(
            680
        );
    });

    test.eachFramework(
        'fitCellToContents combinations of skipHeaders and scaleUpToFitGridWidth',
        async ({ page, agIdFor }) => {
            // `skipHeaders`
            await page.locator('#toggle-ignore-headers').click(); // on
            await page.locator('button.resize-button').click();

            expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(185);
            expect(await getWidth(agIdFor.headerCell('age'))).toEqual(69);
            expect(await getWidth(agIdFor.headerCell('country'))).toEqual(137);
            expect(await getWidth(agIdFor.headerCell('year'))).toEqual(86);
            expect(await getWidth(agIdFor.headerCell('date'))).toEqual(130);
            expect(
                await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))
            ).toEqual(607);

            // `scaleUpToFitGridWidth`
            await page.locator('#toggle-ignore-headers').click(); // off
            await page.locator('#toggle-scale-up').click(); // on
            await page.locator('button.resize-button').click();

            expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(185);
            expect(await getWidth(agIdFor.headerCell('age'))).toEqual(150);
            expect(await getWidth(agIdFor.headerCell('country'))).toEqual(342);
            expect(await getWidth(agIdFor.headerCell('year'))).toEqual(256);
            expect(await getWidth(agIdFor.headerCell('date'))).toEqual(313);
            expect(
                await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))
            ).toEqual(1246);

            // `skipHeaders` and `scaleUpToFitGridWidth`
            await page.locator('#toggle-ignore-headers').click(); // on
            await page.locator('button.resize-button').click();

            expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(185);
            expect(await getWidth(agIdFor.headerCell('age'))).toEqual(150);
            expect(await getWidth(agIdFor.headerCell('country'))).toEqual(342);
            expect(await getWidth(agIdFor.headerCell('year'))).toEqual(256);
            expect(await getWidth(agIdFor.headerCell('date'))).toEqual(313);
            expect(
                await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))
            ).toEqual(1246);
        }
    );
});
