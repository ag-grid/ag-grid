import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders no row or header checkboxes', async ({ page }) => {
        await ensureGridReady(page);

        // checkboxes: false and headerCheckbox: false remove the checkbox column entirely.
        await expect(page.locator('.ag-grid-scrolling-container .ag-selection-checkbox')).toHaveCount(0);
        await expect(page.locator('.ag-header-select-all')).toHaveCount(0);
    });

    test.eachFramework('click selection with ctrl adds rows to the selection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // enableClickSelection: true — clicking a row selects it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // Ctrl-clicking another row adds it to the selection under multiRow mode.
        await agIdFor
            .cell('2', 'athlete')
            .first()
            .click({ modifiers: ['ControlOrMeta'] });
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });
});
