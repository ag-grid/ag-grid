import { dragOverTo, ensureGridReady, expect, gridApiHandle, gridEventLog, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.describe('Events', () => {
        test.eachFramework(`Copydown`, async ({ page, agIdFor }) => {
            const cell = agIdFor.cell('0', 'a');
            await expect(cell).toHaveText('a-0');

            const log = await gridEventLog(page, '1');
            await log.record('cellValueChanged', ['newValue', 'oldValue', 'source']);

            const cells = [1, 2, 3, 4].map((i) => agIdFor.cell(`${i}`, 'a'));
            const [source, target] = cells;

            await source.click();

            await dragOverTo(source, target);

            const fillHandle = agIdFor.fillHandle();

            await expect(cells[0]).toHaveText('a-1');
            await expect(cells[1]).toHaveText('a-2');
            await expect(cells[2]).toHaveText('a-3');
            await expect(cells[3]).toHaveText('a-4');

            await fillHandle.dblclick();

            await expect(cells[0]).toHaveText('a-1');
            await expect(cells[1]).toHaveText('a-2');
            await expect(cells[2]).toHaveText('a-1');
            await expect(cells[3]).toHaveText('a-2');

            await expect.poll(() => log.entries()).toHaveLength(97);
            const eventLog = await log.entries();

            expect(eventLog.length).toBe(97);
            expect(eventLog.slice(0, 2)).toEqual([
                [
                    'cellValueChanged',
                    {
                        newValue: {
                            actualValueA: 'a-1',
                            anotherPropertyA: 'a',
                        },
                        oldValue: {
                            actualValueA: 'a-3',
                            anotherPropertyA: 'a',
                        },
                        source: 'rangeSvc',
                    },
                ],
                [
                    'cellValueChanged',
                    {
                        newValue: {
                            actualValueA: 'a-2',
                            anotherPropertyA: 'a',
                        },
                        oldValue: {
                            actualValueA: 'a-4',
                            anotherPropertyA: 'a',
                        },
                        source: 'rangeSvc',
                    },
                ],
            ]);
        });
    });

    // Docs: "Complex object cell values must be immutable. If the cell values are mutated,
    // undo / redo will not be able to restore the original values." - a fill handle copydown on
    // column A must be fully undoable.
    test.eachFramework(`undo restores complex object values after a copydown`, async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        const api = await gridApiHandle(page, '1');

        const cells = [1, 2, 3, 4].map((i) => agIdFor.cell(`${i}`, 'a'));
        const [source, target] = cells;

        await source.click();
        await dragOverTo(source, target);

        await agIdFor.fillHandle().dblclick();

        // The copydown repeats the first two values over the range.
        await expect(cells[0]).toHaveText('a-1');
        await expect(cells[1]).toHaveText('a-2');
        await expect(cells[2]).toHaveText('a-1');
        await expect(cells[3]).toHaveText('a-2');

        // Undo restores the original complex object values (the Value Parser returns new objects).
        await api.evaluate((api) => api.undoCellEditing());
        await expect(cells[0]).toHaveText('a-1');
        await expect(cells[1]).toHaveText('a-2');
        await expect(cells[2]).toHaveText('a-3');
        await expect(cells[3]).toHaveText('a-4');
    });

    // Docs, column A: Value Getter / Formatter / Setter / Parser plus `equals` let a manual edit
    // round-trip through the complex object and back out again on undo.
    test.eachFramework(`manual edit of column A is undone and redone`, async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        const api = await gridApiHandle(page, '1');

        const cell = agIdFor.cell('0', 'a');
        await expect(cell).toHaveText('a-0');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('a-999');
        await page.keyboard.press('Enter');
        await expect(cell).toHaveText('a-999');

        await api.evaluate((api) => api.undoCellEditing());
        await expect(cell).toHaveText('a-0');

        await api.evaluate((api) => api.redoCellEditing());
        await expect(cell).toHaveText('a-999');
    });

    // Docs, column B: "The column values are complex objects", converted by a Value Formatter for
    // display and back by a Value Parser on edit - so editing and undoing works there too.
    test.eachFramework(`edit of column B is undone`, async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        const api = await gridApiHandle(page, '1');

        const cell = agIdFor.cell('0', 'b');
        await expect(cell).toHaveText('b-0');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('b-999');
        await page.keyboard.press('Enter');
        await expect(cell).toHaveText('b-999');

        await api.evaluate((api) => api.undoCellEditing());
        await expect(cell).toHaveText('b-0');
    });
});
