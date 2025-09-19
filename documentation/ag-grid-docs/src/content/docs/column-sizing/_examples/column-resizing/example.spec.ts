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

    test.eachFramework('fitCellToContents + scaleUpToFitGridWidth does not scale down', async ({ agIdFor, page }) => {
        // need to set the viewport size to less than the column width to test the scale-down
        await page.setViewportSize({ width: 400, height: 600 });

        await page.locator('#toggle-scale-up').click(); // on
        await page.locator('button.resize-button').click();

        expect(await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))).toEqual(
            680
        );
    });

    test.describe('Example modifications', () => {
        test.use({ agModules: ['RowSelectionModule'] });

        test.eachFramework('fitCellContents + pinned col + selection col', async ({ page, remoteGrid, agIdFor }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.setGridOption('rowSelection', { mode: 'multiRow' });
            await remoteApi.setGridOption('columnDefs', [
                { field: 'athlete', width: 150, pinned: 'left' },
                {
                    field: 'age',
                    headerName: 'Age of Athlete',
                    width: 90,
                },
                { field: 'country', width: 120 },
                { field: 'year', width: 90 },
                { field: 'date', width: 110 },
            ]);

            await page.locator('#toggle-scale-up').click(); // on
            await page.locator('button.resize-button').click();

            expect(await getWidth(agIdFor.headerCell('athlete'))).toEqual(185);
            expect(await getWidth(agIdFor.headerCell('age'))).toEqual(222);
            expect(await getWidth(agIdFor.headerCell('country'))).toEqual(296);
            expect(await getWidth(agIdFor.headerCell('year'))).toEqual(222);
            expect(await getWidth(agIdFor.headerCell('date'))).toEqual(271);

            expect(await getWidth(agIdFor.headerCell('ag-Grid-SelectionColumn'))).toEqual(50);

            const pinnedWidth =
                (await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))) ?? 0;
            const mainWidth =
                (await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('age') }))) ?? 0;
            expect(pinnedWidth + mainWidth).toEqual(1246);
        });
    });
});
