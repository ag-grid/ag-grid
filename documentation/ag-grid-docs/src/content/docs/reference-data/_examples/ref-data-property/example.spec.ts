import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // colIds: 'make', 'exteriorColour', 'interiorColour', 'retailPrice' (colId),
    //         'Retail Price (incl Taxes)' (anonymous) -> '0'.
    // Row 0 data: make 'tyt', exteriorColour 'fg', interiorColour 'bw', price 35000.
    // refData maps: tyt->Toyota, fg->Forest Green, bw->Burlywood.

    test.eachFramework('refData maps stored codes to display values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'exteriorColour')).toContainText('Forest Green');
        await expect(agIdFor.cell('0', 'interiorColour')).toContainText('Burlywood');
    });

    test.eachFramework('price valueGetter/formatter and the chained taxes getter compute values', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Retail Price = price formatted as currency; taxes column = retailPrice * 1.2.
        await expect(agIdFor.cell('0', 'retailPrice')).toContainText('£35,000');
        await expect(agIdFor.cell('0', '0')).toContainText('£42,000');
    });

    test.eachFramework('retail price valueSetter round-trips and re-drives the chained getter', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const priceCell = agIdFor.cell('0', 'retailPrice');
        await priceCell.dblclick();
        const editor = priceCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('50000');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // valueSetter stores 50000; taxes = 50000 * 1.2 = 60000.
        await expect(priceCell).toContainText('£50,000');
        await expect(agIdFor.cell('0', '0')).toContainText('£60,000');
    });

    test.eachFramework('editing a refData cell stores the entered code and displays the mapped value', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const interiorCell = agIdFor.cell('0', 'interiorColour');
        await interiorCell.dblclick();
        const editor = interiorCell.locator('input');
        await expect(editor).toBeVisible();
        // With refData + a text editor the raw code must be entered; 'fg' maps to Forest Green.
        await editor.fill('fg');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect(interiorCell).toContainText('Forest Green');
    });
});
