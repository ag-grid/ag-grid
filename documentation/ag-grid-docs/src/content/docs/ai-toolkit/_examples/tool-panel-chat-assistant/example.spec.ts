import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Chat assistant tool panel is open by default', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // defaultToolPanel: 'chatPanel' means the custom AI Assistant panel renders on load.
        const chatPanel = page.locator('.chat-tool-panel');
        await expect(chatPanel).toBeVisible();
        await expect(chatPanel.locator('.chat-title')).toContainText('AI Assistant');
        await expect(chatPanel.locator('.chat-input')).toBeVisible();

        // Amount column uses a currency valueFormatter, so the first cell shows a currency symbol.
        await expect(agIdFor.cell('0', 'amount')).toContainText(/[£€$]/);
    });

    test.eachFramework('Typing into the chat input is captured', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const input = page.locator('.chat-input');
        await input.fill('show only failed transactions');
        await expect(input).toHaveValue('show only failed transactions');
    });

    test.eachFramework('Sorting by amount reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const topAmountCell = page.locator('.ag-row[row-index="0"] [col-id="amount"]').first();
        const before = (await topAmountCell.innerText()).trim();

        await agIdFor.headerCell('amount').click(); // ascending
        await expect(agIdFor.headerCell('amount')).toHaveAttribute('aria-sort', 'ascending');
        await page.waitForTimeout(300); // avoid a double-click

        await agIdFor.headerCell('amount').click(); // descending
        await expect(agIdFor.headerCell('amount')).toHaveAttribute('aria-sort', 'descending');

        const after = (await topAmountCell.innerText()).trim();
        expect(after).not.toBe(before);
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
