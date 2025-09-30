import { type AgGridFixtures, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number | undefined> {
    return (await locator.boundingBox())?.width;
}

const COL_IDS = ['athlete', 'age', 'country', 'year', 'date'] as const;

type ColIds = (typeof COL_IDS)[number];

function getHeaders(agIdFor: AgGridFixtures['agIdFor']): Record<ColIds, Locator> {
    return Object.fromEntries(COL_IDS.map((colId) => [colId, agIdFor.headerCell(colId)])) as Record<ColIds, Locator>;
}

async function getHeaderWidths(headers: Record<ColIds, Locator>): Promise<Record<ColIds, number>> {
    return Object.fromEntries(
        await Promise.all(
            Object.entries(headers).map(async ([colId, locator]) => [colId, (await getWidth(locator)) ?? 0])
        )
    );
}

async function totalHeaderWidth(headers: Record<ColIds, Locator>): Promise<number> {
    const widths = await Promise.all(Object.values(headers).map(getWidth));
    return widths.reduce<number>((acc, w) => acc + (w ?? 0), 0);
}

test.agExample(import.meta, () => {
    test.eachFramework('fitCellToContents', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        const headers = getHeaders(agIdFor);
        const headerRow = page.locator('.ag-header-row').filter({ has: headers.athlete });
        const baseHeaderWidths = await getHeaderWidths(headers);

        expect(await getWidth(headerRow)).toEqual(await totalHeaderWidth(headers));

        await page.locator('button.resize-button').click();
        const apiResizedHeaderWidths = await getHeaderWidths(headers);
        // API call doesn't use defaultMaxWidth so we expect a larger column
        expect(apiResizedHeaderWidths.athlete).toBeGreaterThan(baseHeaderWidths.athlete);
        expect(apiResizedHeaderWidths.age).toBe(baseHeaderWidths.age);
        expect(apiResizedHeaderWidths.country).toBe(baseHeaderWidths.country);
        expect(apiResizedHeaderWidths.year).toBe(baseHeaderWidths.year);
        expect(apiResizedHeaderWidths.date).toBe(baseHeaderWidths.date);
        expect(await getWidth(headerRow)).toEqual(await totalHeaderWidth(headers));

        // `skipHeaders only`
        await page.locator('#toggle-ignore-headers').click(); // on
        await page.locator('button.resize-button').click();

        // when we skip headers, we expect all widths to be the same except for the age column, which is narrower now
        const headerSkippedWidths = await getHeaderWidths(headers);

        expect(headerSkippedWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        expect(headerSkippedWidths.age).toBeLessThan(apiResizedHeaderWidths.age);
        expect(headerSkippedWidths.country).toBe(apiResizedHeaderWidths.country);
        expect(headerSkippedWidths.year).toBe(apiResizedHeaderWidths.year);
        expect(headerSkippedWidths.date).toBe(apiResizedHeaderWidths.date);
        expect(await getWidth(headerRow)).toEqual(await totalHeaderWidth(headers));

        // `scaleUpToFitGridWidth only`
        await page.locator('#toggle-ignore-headers').click(); // off
        await page.locator('#toggle-scale-up').click(); // on
        await page.locator('button.resize-button').click();
        const scaledUpHeaderWidths = await getHeaderWidths(headers);

        expect(scaledUpHeaderWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        // here the age column needs to be scaled up to fill the grid
        expect(scaledUpHeaderWidths.age).toBeGreaterThan(baseHeaderWidths.age);
        expect(scaledUpHeaderWidths.country).toBeGreaterThan(baseHeaderWidths.country);
        expect(scaledUpHeaderWidths.year).toBeGreaterThan(baseHeaderWidths.year);
        expect(scaledUpHeaderWidths.date).toBeGreaterThan(baseHeaderWidths.date);
        expect(await getWidth(headerRow)).toEqual(await totalHeaderWidth(headers));

        // `skipHeaders` and `scaleUpToFitGridWidth`
        await page.locator('#toggle-ignore-headers').click(); // on
        await page.locator('button.resize-button').click();
        const headerSkippedAndScaledUpHeaderWidths = await getHeaderWidths(headers);

        expect(headerSkippedAndScaledUpHeaderWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        expect(headerSkippedAndScaledUpHeaderWidths.age).toBe(scaledUpHeaderWidths.age);
        expect(headerSkippedAndScaledUpHeaderWidths.country).toBe(scaledUpHeaderWidths.country);
        expect(headerSkippedAndScaledUpHeaderWidths.year).toBe(scaledUpHeaderWidths.year);
        expect(headerSkippedAndScaledUpHeaderWidths.date).toBe(scaledUpHeaderWidths.date);
        expect(await getWidth(headerRow)).toEqual(await totalHeaderWidth(headers));
    });

    test.eachFramework('fitCellToContents + scaleUpToFitGridWidth does not scale down', async ({ agIdFor, page }) => {
        // need to set the viewport size to less than the column width to test the scale-down
        await page.setViewportSize({ width: 400, height: 600 });

        await waitForGridContent(page);

        await page.locator('#toggle-scale-up').click(); // on
        await page.locator('button.resize-button').click();

        expect(
            await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))
        ).toBeGreaterThan(600);
    });

    test.describe('Example modifications', () => {
        test.use({ agModules: ['RowSelectionModule'] });

        test.eachFramework('fitCellContents + pinned col + selection col', async ({ page, remoteGrid, agIdFor }) => {
            const headers = getHeaders(agIdFor);

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
            const baseHeaderWidths = await getHeaderWidths(headers);

            await waitForGridContent(page);

            await page.locator('#toggle-scale-up').click(); // on
            await page.locator('button.resize-button').click();
            const apiResizedHeaderWidths = await getHeaderWidths(headers);

            expect(apiResizedHeaderWidths.athlete).toBeGreaterThan(baseHeaderWidths.athlete);
            expect(apiResizedHeaderWidths.age).toBeGreaterThan(baseHeaderWidths.age);
            expect(apiResizedHeaderWidths.country).toBeGreaterThan(baseHeaderWidths.country);
            expect(apiResizedHeaderWidths.year).toBeGreaterThan(baseHeaderWidths.year);
            expect(apiResizedHeaderWidths.date).toBeGreaterThan(baseHeaderWidths.date);

            expect(await getWidth(agIdFor.headerCell('ag-Grid-SelectionColumn'))).toEqual(50);

            const pinnedWidth = (await getWidth(page.locator('.ag-header-row').filter({ has: headers.athlete }))) ?? 0;
            const mainWidth = (await getWidth(page.locator('.ag-header-row').filter({ has: headers.age }))) ?? 0;

            // +50 for the selection column
            expect(pinnedWidth + mainWidth).toEqual((await totalHeaderWidth(headers)) + 50);
        });
    });
});
