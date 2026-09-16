import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // colIds: 'make', 'exteriorColour', 'interiorColour', 'retailPrice' (colId),
    //         'Retail Price (incl Taxes)' (anonymous) -> '0'.
    // Row 0 data: make 'tyt', exteriorColour 'fg', interiorColour 'bw', price 35000.
    // valueFormatters map codes to names: tyt->Toyota, fg->Forest Green, bw->Burlywood.

    test.eachFramework('valueFormatters map stored codes to display values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'exteriorColour')).toContainText('Forest Green');
        await expect(agIdFor.cell('0', 'interiorColour')).toContainText('Burlywood');
    });

    test.eachFramework(
        'price valueGetter/formatter and the chained taxes getter compute values',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await expect(agIdFor.cell('0', 'retailPrice')).toContainText('£35,000');
            await expect(agIdFor.cell('0', '0')).toContainText('£42,000');
        }
    );

    test.eachFramework(
        'retail price valueSetter round-trips and re-drives the chained getter',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const priceCell = agIdFor.cell('0', 'retailPrice');
            await priceCell.dblclick();
            const editor = priceCell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill('50000');
            await page.keyboard.press('Enter');
            await expect(editor).toHaveCount(0);

            await expect(priceCell).toContainText('£50,000');
            await expect(agIdFor.cell('0', '0')).toContainText('£60,000');
        }
    );

    test.eachFramework(
        'text editor with useFormatter edits by name and the valueParser stores the code',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const interiorCell = agIdFor.cell('0', 'interiorColour');
            await interiorCell.dblclick();
            const editor = interiorCell.locator('input');
            await expect(editor).toBeVisible();
            // useFormatter shows the name for editing; entering the name 'Cadet Blue' is parsed to 'cb'.
            await editor.fill('Cadet Blue');
            await page.keyboard.press('Enter');
            await expect(editor).toHaveCount(0);

            await expect(interiorCell).toContainText('Cadet Blue');
        }
    );
    test.eachFramework('Set filters list the mapped names rather than the codes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // exteriorColour is the set-filtered column here; filterParams.valueFormatter maps
        // each stored code to its name, so the list shows names rather than 'cb'/'bw'/'fg'.
        const spec = { source: 'column-filter' } as const;
        await agIdFor.headerFilterButton('exteriorColour').click();

        await expect(agIdFor.setFilterInstanceItem(spec, 'Cadet Blue')).toBeVisible();
        await expect(agIdFor.setFilterInstanceItem(spec, 'Forest Green')).toBeVisible();
        await expect(agIdFor.setFilterInstanceItem(spec, 'cb')).toHaveCount(0);
        await page.keyboard.press('Escape');
    });

    test.eachFramework('The select editor lists names and stores the code', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const makeCell = agIdFor.cell('0', 'make');
        await makeCell.dblclick();

        // agSelectCellEditor shows the mapped name for the current code.
        const picker = makeCell.locator('.ag-cell-editor.ag-select');
        await expect(picker.locator('.ag-picker-field-display')).toHaveText('Toyota');

        await picker.click();
        const options = page.locator('.ag-select-list .ag-list-item');
        await expect(options.filter({ hasText: 'Ford' })).toBeVisible();
        await expect(options.filter({ hasText: 'Porsche' })).toBeVisible();
        await options.filter({ hasText: 'Ford' }).click();
        await page.keyboard.press('Enter');

        // 'frd' is stored underneath; the cell shows the mapped name.
        await expect(makeCell).toContainText('Ford');
    });

    test.eachFramework('The rich select editor lists names too', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const colourCell = agIdFor.cell('0', 'exteriorColour');
        await colourCell.dblclick();

        const list = page.locator('.ag-rich-select-list').first();
        await expect(list).toBeVisible();
        await expect(list.locator('.ag-rich-select-row', { hasText: 'Cadet Blue' }).first()).toBeVisible();
        await expect(list.locator('.ag-rich-select-row', { hasText: 'Burlywood' }).first()).toBeVisible();
        // The stored codes are never offered to the user.
        await expect(list.locator('.ag-rich-select-row', { hasText: /^cb$/ })).toHaveCount(0);

        await list.locator('.ag-rich-select-row', { hasText: 'Cadet Blue' }).first().click();
        await expect(colourCell).toContainText('Cadet Blue');
    });
});
