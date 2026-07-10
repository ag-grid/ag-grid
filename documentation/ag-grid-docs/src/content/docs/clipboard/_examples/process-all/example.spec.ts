import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the colour-coded source data', async ({ agIdFor }) => {
        // data.ts row 0: a='Green 0', c='Blue 0155', d='Red 0265', e='Yellow 023'.
        await expect(agIdFor.cell('0', 'a')).toContainText('Green 0');
        await expect(agIdFor.cell('0', 'c')).toContainText('Blue 0155');
        await expect(agIdFor.cell('0', 'd')).toContainText('Red 0265');
        await expect(agIdFor.cell('0', 'e')).toContainText('Yellow 023');
    });

    test.eachFramework('Cells are coloured by their value prefix', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'a')).toHaveClass(/cell-green/);
        await expect(agIdFor.cell('0', 'c')).toHaveClass(/cell-blue/);
        await expect(agIdFor.cell('0', 'd')).toHaveClass(/cell-red/);
        await expect(agIdFor.cell('0', 'e')).toHaveClass(/cell-yellow/);
    });

    test.eachFramework('Editing a value re-applies the colour rule', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'a');
        await expect(cell).toHaveClass(/cell-green/);

        await cell.dblclick();
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('Red now');
        await input.press('Enter');

        await expect(cell).toContainText('Red now');
        await expect(cell).toHaveClass(/cell-red/);
    });
});
