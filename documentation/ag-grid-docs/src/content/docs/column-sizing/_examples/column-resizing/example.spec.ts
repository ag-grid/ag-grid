import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const cellBBs = await Promise.all(
            [
                agIdFor.headerCell('athlete'),
                agIdFor.headerCell('age'),
                agIdFor.headerCell('country'),
                agIdFor.headerCell('year'),
                agIdFor.headerCell('date'),
            ].map((locator) => locator.boundingBox())
        );

        const headerRow = page.locator('.ag-header-row').filter({ has: agIdFor.headerCell('athlete') });
        const headerRowBB = await headerRow.boundingBox();

        const totalColumnWidth = cellBBs.reduce((acc, bb) => acc + (bb?.width ?? 0), 0);

        expect(headerRowBB?.width).toBeCloseTo(totalColumnWidth, 1);
    });
});
