import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the car data across the three columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'model')).toContainText('Celica');
        await expect(agIdFor.cell('0', 'price')).toContainText('35000');

        await expect(agIdFor.cell('4', 'make')).toContainText('Aston Martin');
        await expect(agIdFor.cell('4', 'price')).toContainText('190000');
    });

    test.eachFramework('Sorting by price reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Aston Martin (row 4) has the unique max price of 190000.
        const astonRow = agIdFor.rowNode('4');
        await expect(astonRow).toHaveAttribute('row-index', '4');

        await agIdFor.headerCell('price').click(); // ascending: max floats to the bottom
        await expect(agIdFor.headerCell('price')).toHaveAttribute('aria-sort', 'ascending');
        await expect(astonRow).toHaveAttribute('row-index', '4');

        await page.waitForTimeout(300); // avoid a double-click
        await agIdFor.headerCell('price').click(); // descending: max floats to the top
        await expect(agIdFor.headerCell('price')).toHaveAttribute('aria-sort', 'descending');
        await expect(astonRow).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Log buttons emit the column details to the console', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const messages: string[] = [];
        page.on('console', (msg) => messages.push(msg.text()));

        await page.getByRole('button', { name: 'Log All Column IDs' }).click();
        await page.waitForTimeout(200);

        const joined = messages.join(' ');
        expect(joined).toContain('make');
        expect(joined).toContain('model');
        expect(joined).toContain('price');
    });
});
