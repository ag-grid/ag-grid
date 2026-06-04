import { clickAllButtons, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });

    test.vanilla('Structured schema snapshot', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);
        const schema = await gridApi.getStructuredSchema();

        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('structured-schema.json');
    });

    test.vanilla('Schema after columns removed', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);
        await gridApi.setGridOption('columnDefs', [
            { field: 'country', filter: 'agSetColumnFilter' },
            { field: 'amount', filter: 'agNumberColumnFilter' },
        ]);

        const schema = await gridApi.getStructuredSchema();
        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('schema-columns-removed.json');
    });

    test.vanilla('Schema with exclude parameter', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);
        const schema = await gridApi.getStructuredSchema({ exclude: ['pivot', 'rowGroup', 'aggregation'] });
        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('schema-exclude-pivot-rowgroup-agg.json');
    });
});
