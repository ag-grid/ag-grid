import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

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
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('price')).toHaveAttribute('aria-sort', 'ascending');
        await expect(astonRow).toHaveAttribute('row-index', '4');

        await agIdFor.headerCell('price').click(); // descending: max floats to the top
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('price')).toHaveAttribute('aria-sort', 'descending');
        await expect(astonRow).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Log buttons emit the column details to the console', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const messages: string[] = [];
        // Resolve each logged argument to its JSON value rather than reading msg.text().
        // Firefox renders a logged array as the literal "Array" via msg.text(), so the
        // column ids never appear; reading the args gives the contents on every browser.
        page.on('console', (msg) => {
            Promise.all(msg.args().map((arg) => arg.jsonValue().catch(() => undefined)))
                .then((values) => messages.push(JSON.stringify(values)))
                .catch(() => messages.push(msg.text()));
        });

        await page.getByRole('button', { name: 'Log All Column IDs' }).click();
        // A single click logs all IDs synchronously, so once one appears they all have;
        // retry until the console message arrives over CDP.
        await expect(() => {
            expect(messages.join(' ')).toContain('make');
        }).toPass();

        const joined = messages.join(' ');
        expect(joined).toContain('make');
        expect(joined).toContain('model');
        expect(joined).toContain('price');
    });
});
