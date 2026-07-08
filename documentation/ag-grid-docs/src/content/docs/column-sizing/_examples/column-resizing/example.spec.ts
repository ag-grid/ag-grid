import { type AgGridFixtures, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

import type { ColDef } from 'ag-grid-community';

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

// wait twice as long as animation so we know widths have settled
async function waitForAnimation(page: Page): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(page.locator('.ag-animate-autosize')).not.toBeVisible();
}

test.agExample(import.meta, () => {
    test.eachFramework('fitCellToContents', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await waitForAnimation(page);
        const headers = getHeaders(agIdFor);
        const centerHeaderSection = page.locator('.ag-header-row .ag-grid-scrolling-cells').first();
        const baseHeaderWidths = await getHeaderWidths(headers);

        expect(await getWidth(centerHeaderSection)).toEqual(await totalHeaderWidth(headers));

        await page.locator('button.resize-button').click();
        await waitForAnimation(page);

        const apiResizedHeaderWidths = await getHeaderWidths(headers);
        // Athlete column has suppressAutoSize: true so we expect the width to be unchanged
        expect(apiResizedHeaderWidths.athlete).toBe(baseHeaderWidths.athlete);
        expect(apiResizedHeaderWidths.age).toBe(baseHeaderWidths.age);
        expect(apiResizedHeaderWidths.country).toBe(baseHeaderWidths.country);
        expect(apiResizedHeaderWidths.year).toBe(baseHeaderWidths.year);
        expect(apiResizedHeaderWidths.date).toBe(baseHeaderWidths.date);
        expect(await getWidth(centerHeaderSection)).toEqual(await totalHeaderWidth(headers));

        // `skipHeaders only`
        await page.locator('#toggle-ignore-headers').click(); // on
        await page.locator('button.resize-button').click();
        await waitForAnimation(page);

        // when we skip headers, we expect all widths to be the same except for the age column, which is narrower now
        const headerSkippedWidths = await getHeaderWidths(headers);

        expect(headerSkippedWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        expect(headerSkippedWidths.age).toBeLessThan(apiResizedHeaderWidths.age);
        expect(headerSkippedWidths.country).toBe(apiResizedHeaderWidths.country);
        expect(headerSkippedWidths.year).toBe(apiResizedHeaderWidths.year);
        expect(headerSkippedWidths.date).toBe(apiResizedHeaderWidths.date);
        expect(await getWidth(centerHeaderSection)).toEqual(await totalHeaderWidth(headers));

        // `scaleUpToFitGridWidth only`
        await page.locator('#toggle-ignore-headers').click(); // off
        await page.locator('#toggle-scale-up').click(); // on
        await page.locator('button.resize-button').click();
        await waitForAnimation(page);

        const scaledUpHeaderWidths = await getHeaderWidths(headers);

        expect(scaledUpHeaderWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        // age has maxWidth: 150; on browsers where fitCellContents already pegs it at the cap
        // (e.g. Firefox font rendering), scaleUp can't grow it further, so >= rather than >.
        // country/year/date below have no maxWidth and still strictly prove scale-up worked.
        expect(scaledUpHeaderWidths.age).toBeGreaterThanOrEqual(baseHeaderWidths.age);
        expect(scaledUpHeaderWidths.country).toBeGreaterThan(baseHeaderWidths.country);
        expect(scaledUpHeaderWidths.year).toBeGreaterThan(baseHeaderWidths.year);
        expect(scaledUpHeaderWidths.date).toBeGreaterThan(baseHeaderWidths.date);
        expect(await getWidth(centerHeaderSection)).toEqual(await totalHeaderWidth(headers));

        // `skipHeaders` and `scaleUpToFitGridWidth`
        await page.locator('#toggle-ignore-headers').click(); // on
        await page.locator('button.resize-button').click();
        await waitForAnimation(page);

        const headerSkippedAndScaledUpHeaderWidths = await getHeaderWidths(headers);

        expect(headerSkippedAndScaledUpHeaderWidths.athlete).toBe(apiResizedHeaderWidths.athlete);
        expect(headerSkippedAndScaledUpHeaderWidths.age).toBe(scaledUpHeaderWidths.age);
        expect(headerSkippedAndScaledUpHeaderWidths.country).toBe(scaledUpHeaderWidths.country);
        expect(headerSkippedAndScaledUpHeaderWidths.year).toBe(scaledUpHeaderWidths.year);
        expect(headerSkippedAndScaledUpHeaderWidths.date).toBe(scaledUpHeaderWidths.date);
        expect(await getWidth(centerHeaderSection)).toEqual(await totalHeaderWidth(headers));
    });

    test.eachFramework('fitCellToContents + scaleUpToFitGridWidth does not scale down', async ({ agIdFor, page }) => {
        // need to set the viewport size to less than the column width to test the scale-down
        await page.setViewportSize({ width: 400, height: 600 });

        await waitForGridContent(page);

        await page.locator('#toggle-scale-up').click(); // on
        await page.locator('button.resize-button').click();
        await waitForAnimation(page);

        expect(
            await getWidth(page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') }))
        ).toBeGreaterThan(600);
    });

    test.eachFramework(
        'fitCellContents on an empty grid sizes headers to content',
        async ({ page, remoteGrid, agIdFor }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('columnDefs', [
                { field: 'athlete', minWidth: 40 },
                { field: 'age', headerName: 'Age of Athlete', minWidth: 40 },
                { field: 'country', minWidth: 40 },
                { field: 'year', minWidth: 40 },
                { field: 'date', minWidth: 40 },
            ]);

            await waitForGridContent(page);

            // the fetch that populates rowData only fires once on load, so clearing it leaves the grid
            // empty for the rest of the test
            await remoteApi.setGridOption('rowData', []);

            await remoteApi.autoSizeAllColumns({});
            await waitForAnimation(page);

            const headers = getHeaders(agIdFor);
            const widths = await getHeaderWidths(headers);

            // when a column measures its width against the (display:none) row container it collapses to
            // minWidth; every column would then share the same floor width. Sizing against the header
            // content instead gives the longer "Age of Athlete" label a wider column than "Year".
            expect(widths.age).toBeGreaterThan(widths.year);
            expect(widths.year).toBeGreaterThan(40);
            expect(widths.country).toBeGreaterThan(40);
            expect(widths.date).toBeGreaterThan(40);
        }
    );

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
            await waitForAnimation(page);

            const apiResizedHeaderWidths = await getHeaderWidths(headers);

            expect(apiResizedHeaderWidths.athlete).toBeGreaterThan(baseHeaderWidths.athlete);
            expect(apiResizedHeaderWidths.age).toBeGreaterThan(baseHeaderWidths.age);
            expect(apiResizedHeaderWidths.country).toBeGreaterThan(baseHeaderWidths.country);
            expect(apiResizedHeaderWidths.year).toBeGreaterThan(baseHeaderWidths.year);
            expect(apiResizedHeaderWidths.date).toBeGreaterThan(baseHeaderWidths.date);

            expect(await getWidth(agIdFor.headerCell('ag-Grid-SelectionColumn'))).toEqual(50);

            const pinnedWidth =
                (await getWidth(page.locator('.ag-header-row .ag-grid-pinned-left-cells').first())) ?? 0;
            const mainWidth = (await getWidth(page.locator('.ag-header-row .ag-grid-scrolling-cells').first())) ?? 0;

            // +50 for the selection column
            expect(pinnedWidth + mainWidth).toEqual((await totalHeaderWidth(headers)) + 50);
        });

        test.eachFramework(
            'fitCellToContents + scaleUpToFitGridWidth wide screen, no down-scaling',
            async ({ agIdFor, page, remoteGrid }) => {
                await page.setViewportSize({ width: 1600, height: 800 });

                await waitForGridContent(page);

                const remoteApi = remoteGrid(page, '1');
                const colDefs: ColDef[] = [
                    { field: 'athlete', width: 150, suppressAutoSize: true },
                    {
                        field: 'age',
                        headerName: 'Age of Athlete',
                        width: 90,
                        minWidth: 50,
                        maxWidth: 150,
                    },
                    { field: 'country', width: 120 },
                    { field: 'year', width: 90 },
                    { field: 'date', width: 110 },
                    { field: 'bronze', width: 90 },
                    { field: 'silver', width: 90 },
                    { field: 'gold', width: 90 },
                    { field: 'total', width: 90 },
                    { field: 'test', width: 200 },
                ];
                await remoteApi.setGridOption('columnDefs', colDefs);

                const rowData = await remoteApi.getGridOption('rowData');
                await remoteApi.setGridOption(
                    'rowData',
                    rowData.map((d: any) => {
                        d['test'] = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.';
                        return d;
                    })
                );
                await remoteApi.autoSizeAllColumns({});

                const columnWidths = Object.fromEntries(
                    await Promise.all(
                        colDefs.map(async (c) => {
                            return [c.field, await getWidth(agIdFor.headerCell(c.field!))];
                        })
                    )
                );

                await page.locator('#toggle-scale-up').click(); // on
                await page.locator('button.resize-button').click();
                await waitForAnimation(page);

                const newColumnWidths = Object.fromEntries(
                    await Promise.all(
                        colDefs.map(async (c) => {
                            return [c.field, await getWidth(agIdFor.headerCell(c.field!))];
                        })
                    )
                );

                for (const header in columnWidths) {
                    expect(newColumnWidths[header], `${header} should not get smaller`).toBeGreaterThanOrEqual(
                        columnWidths[header]
                    );
                }
            }
        );
    });
});
