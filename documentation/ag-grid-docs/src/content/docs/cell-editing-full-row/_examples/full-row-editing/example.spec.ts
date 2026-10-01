import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the seeded row data', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First three rows cycle Toyota / Ford / Porsche (see getRowData()).
        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('0', 'model')).toContainText('Celica');
        await expect(agIdFor.cell('0', 'price')).toContainText('35000');

        await expect(agIdFor.cell('1', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('1', 'model')).toContainText('Mondeo');
        await expect(agIdFor.cell('1', 'price')).toContainText('32000');

        await expect(agIdFor.cell('2', 'make')).toContainText('Porsche');
    });

    test.eachFramework('editing one cell puts the whole row into edit mode', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const modelCell = agIdFor.cell('0', 'model');
        await modelCell.dblclick();

        // The double-clicked cell shows a text editor...
        await expect(modelCell.locator('input')).toBeVisible();
        // ...and the row is flagged as editing.
        await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-editing/);
        // ...and a different editable column in the same row also shows an editor (full row edit).
        await expect(agIdFor.cell('0', 'price').locator('input')).toBeVisible();
    });

    test.eachFramework('read only columns stay non-editable during full row edit', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.cell('0', 'model').dblclick();
        await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-editing/);

        // field4 and field6 are editable:false, so no editor input is rendered for them.
        await expect(agIdFor.cell('0', 'field4').locator('input')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'field6').locator('input')).toHaveCount(0);
    });

    test.eachFramework('Start Editing Line 2 button edits the second row via the API', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Start Editing Line 2' }).click();

        // rowIndex 1 becomes editable via startEditingCell, row 0 is unaffected.
        await expect(agIdFor.rowNode('1').first()).toHaveClass(/ag-row-editing/);
        await expect(agIdFor.rowNode('0').first()).not.toHaveClass(/ag-row-editing/);

        // Stop Editing exits edit mode.
        await page.getByRole('button', { name: 'Stop Editing' }).click();
        await expect(agIdFor.rowNode('1').first()).not.toHaveClass(/ag-row-editing/);
    });

    // Docs: full row editing edits every cell in the row at once - hitting Enter commits them all.
    test.eachFramework('committing a full row edit persists every changed cell', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const modelCell = agIdFor.cell('0', 'model');
        const priceCell = agIdFor.cell('0', 'price');

        await modelCell.dblclick();
        await modelCell.locator('input').fill('Supra');
        await priceCell.locator('input').fill('44000');
        await page.keyboard.press('Enter');

        // Both columns of the row keep their new values once editing stops.
        await expect(agIdFor.rowNode('0').first()).not.toHaveClass(/ag-row-editing/);
        await expect(modelCell).toContainText('Supra');
        await expect(priceCell).toContainText('44000');
    });

    // Docs: "Pressing Tab / Shift & Tab while editing will move the focus between the cells on the
    // editing row. Read only cells will be focusable while the row is in edit mode." and
    // "The 'Suppress Navigable' column is not navigable using Tab / Shift & Tab."
    test.eachFramework(
        'Tab moves through read only cells and skips the suppressNavigable column',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const focusedColId = () =>
                page.evaluate(
                    () =>
                        (document.activeElement as HTMLElement | null)?.closest('[col-id]')?.getAttribute('col-id') ??
                        null
                );

            await agIdFor.cell('0', 'model').dblclick();
            await expect.poll(focusedColId).toBe('model');

            // field4 is editable:false but still focusable while the row is editing.
            await page.keyboard.press('Tab');
            await expect.poll(focusedColId).toBe('field4');

            await page.keyboard.press('Tab');
            await expect.poll(focusedColId).toBe('price');

            // field5 has suppressNavigable:true, so Tab jumps straight past it to field6.
            await page.keyboard.press('Tab');
            await expect.poll(focusedColId).toBe('field6');

            // Shift+Tab walks back the same way, skipping field5 again.
            await page.keyboard.press('Shift+Tab');
            await expect.poll(focusedColId).toBe('price');

            // The row is still in edit mode throughout.
            await expect(agIdFor.rowNode('0').first()).toHaveClass(/ag-row-editing/);
        }
    );

    // Docs: "When a row stops editing, the cellValueChanged event gets called for each column whose
    // value has changed, and rowValueChanged gets called once for the row." Both are logged to console.
    test.eachFramework(
        'cellValueChanged fires per changed column, rowValueChanged once per row',
        async ({ page, agIdFor }) => {
            const logs: string[] = [];
            page.on('console', (m) => logs.push(m.text()));

            await ensureGridReady(page);
            await waitForGridContent(page);

            const modelCell = agIdFor.cell('0', 'model');
            const priceCell = agIdFor.cell('0', 'price');

            await modelCell.dblclick();
            await modelCell.locator('input').fill('Supra');
            await priceCell.locator('input').fill('44000');
            await page.keyboard.press('Enter');

            await expect(modelCell).toContainText('Supra');

            // Two columns changed: two cell events, one row event.
            await expect.poll(() => logs.filter((l) => l.startsWith('onCellValueChanged:')).length).toBe(2);
            await expect.poll(() => logs.filter((l) => l.startsWith('onRowValueChanged:')).length).toBe(1);
            expect(logs).toContain('onCellValueChanged: model = Supra');
            expect(logs).toContain('onCellValueChanged: price = 44000');
        }
    );

    // Docs: "focusIn() and focusOut() are only called when the user is tabbing between cells when
    // editing, they are not called as the user double clicks on a cell to start editing that cell".
    // All framework variants of NumericCellEditor log the same two strings.
    test.eachFramework(
        'the custom editor logs focusIn / focusOut on Tab but not on double click',
        async ({ page, agIdFor }) => {
            const logs: string[] = [];
            page.on('console', (m) => logs.push(m.text()));

            await ensureGridReady(page);
            await waitForGridContent(page);

            // Double clicking the price cell starts editing it without calling focusIn().
            await agIdFor.cell('0', 'price').dblclick();
            await expect(agIdFor.cell('0', 'price').locator('input')).toBeVisible();
            expect(logs.filter((l) => l === 'NumericCellEditor.focusIn()')).toHaveLength(0);

            // Tabbing out of the price editor calls focusOut()...
            await page.keyboard.press('Tab');
            await expect.poll(() => logs).toContain('NumericCellEditor.focusOut()');

            // ...and tabbing back into it calls focusIn().
            await page.keyboard.press('Shift+Tab');
            await expect.poll(() => logs).toContain('NumericCellEditor.focusIn()');
        }
    );

    // The 'make' column uses agSelectCellEditor with a fixed list of values.
    test.eachFramework('the make column select editor offers the configured values', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const makeCell = agIdFor.cell('0', 'make');
        await makeCell.dblclick();

        const picker = makeCell.locator('.ag-picker-field-wrapper').first();
        await expect(picker).toBeVisible();
        await picker.click();

        const listItems = page.locator('.ag-select-list .ag-list-item');
        await expect(listItems).toHaveCount(6);
        for (const value of ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC']) {
            await expect(listItems.filter({ hasText: value })).toHaveCount(1);
        }

        // Picking a value and committing the row stores it.
        await listItems.filter({ hasText: 'Porsche' }).click();
        await page.keyboard.press('Enter');
        await expect(makeCell).toContainText('Porsche');
    });

    // The custom NumericCellEditor blocks any single character key that is not a digit.
    test.eachFramework('the numeric editor rejects non-numeric keys', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const priceCell = agIdFor.cell('0', 'price');
        await priceCell.dblclick();

        const input = priceCell.locator('input');
        await input.fill('');
        await input.press('1');
        await input.press('2');
        await input.press('a');
        await input.press('3');

        // The 'a' keystroke was prevented, so only the digits made it into the editor.
        await expect(input).toHaveValue('123');

        await page.keyboard.press('Enter');
        await expect(priceCell).toContainText('123');
    });
});
