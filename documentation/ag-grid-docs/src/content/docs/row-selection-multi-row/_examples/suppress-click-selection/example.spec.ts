import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('enableClickSelection true supports ctrl-click multi-select', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Default control value is 'true' — clicking a row selects it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // Ctrl-clicking another row adds it under multiRow mode.
        await agIdFor
            .cell('2', 'athlete')
            .first()
            .click({ modifiers: ['ControlOrMeta'] });
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('setting enableClickSelection false disables click selection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await page.locator('#select-enable').selectOption('false');
        await waitForRowAnimations(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
