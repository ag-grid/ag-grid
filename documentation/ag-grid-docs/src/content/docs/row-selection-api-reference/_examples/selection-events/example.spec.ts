import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('selecting and deselecting a row fires the selection events', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await ensureGridReady(page);

        // First row of olympic-winners.json is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Selecting the row fires onRowSelected and onSelectionChanged.
        await agIdFor.selectionColumnCheckbox('0').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(() => {
            expect(logs.some((l) => l.includes('row Michael Phelps selected = true'))).toBe(true);
            expect(logs.some((l) => l.includes('selection changed, 1 rows selected'))).toBe(true);
        }).toPass();

        // Deselecting fires the events again with the updated state.
        await agIdFor.selectionColumnCheckbox('0').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
        await expect(() => {
            expect(logs.some((l) => l.includes('row Michael Phelps selected = false'))).toBe(true);
            expect(logs.some((l) => l.includes('selection changed, 0 rows selected'))).toBe(true);
        }).toPass();
    });
});
