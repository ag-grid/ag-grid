import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid loads the Olympic winners dataset', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps (United States, 8 gold in 2008).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Sorting by gold floats the top scorer to the top', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps (node id 0) is the unique maximum with 8 gold medals.
        const phelps = agIdFor.rowNode('0');

        await agIdFor.headerCell('gold').click(); // ascending: 0-gold rows first, Phelps sinks
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'ascending');
        await page.waitForTimeout(300); // avoid a double-click

        await agIdFor.headerCell('gold').click(); // descending: max gold floats to the top
        await waitForRowAnimations(page);
        await expect(phelps).toHaveAttribute('row-index', '0');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
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
            { field: 'athlete', filter: 'agTextColumnFilter' },
            { field: 'country', filter: 'agSetColumnFilter' },
            { field: 'gold', filter: 'agNumberColumnFilter' },
        ]);

        const schema = await gridApi.getStructuredSchema();
        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('schema-columns-removed.json');
    });

    test.vanilla('Schema after disabling sort and filter', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);
        await gridApi.setGridOption('columnDefs', [
            { field: 'athlete', sortable: false, filter: false },
            { field: 'country', sortable: false, filter: false },
        ]);

        const schema = await gridApi.getStructuredSchema();
        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('schema-no-sort-no-filter.json');
    });

    test.vanilla('Schema with exclude parameter', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);
        const schema = await gridApi.getStructuredSchema({ exclude: ['sort', 'filter'] });
        await expect(JSON.stringify(schema, null, 2)).toMatchSnapshot('schema-exclude-sort-filter.json');
    });
});
