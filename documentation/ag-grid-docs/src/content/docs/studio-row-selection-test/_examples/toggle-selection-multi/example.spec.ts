import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicking the only selected row deselects it', async ({ agFramework, agIdFor, page }) => {
        test.skip(
            agFramework === 'vanilla',
            'Vanilla does not support module registration, so the feature flag cannot be set'
        );
        await ensureGridReady(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        'clicking a selected row reduces a multi-row selection first',
        async ({ agFramework, agIdFor, page }) => {
            test.skip(
                agFramework === 'vanilla',
                'Vanilla does not support module registration, so the feature flag cannot be set'
            );
            await ensureGridReady(page);

            await agIdFor.cell('0', 'athlete').first().click();
            await agIdFor
                .cell('2', 'athlete')
                .first()
                .click({ modifiers: ['ControlOrMeta'] });
            await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);

            // row 2 is selected but is not the whole selection, so the click clears the others instead
            await agIdFor.cell('2', 'athlete').first().click();
            await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);

            // now it is the whole selection, so the same click deselects it
            await agIdFor.cell('2', 'athlete').first().click();
            await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
        }
    );
});
