import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.typescript('Cell expressions evaluate against the context', async ({ agIdFor }) => {
        // Left grid: the 'value' column cells start with '=' so they are evaluated.
        // ctx.theNumber = 4.
        // Row 0 'Number Squared': 4 * 4 => 16.
        await expect(agIdFor.cell('0', 'value')).toContainText('16');
        // Row 1 'Number x 2': 4 * 2 => 8.
        await expect(agIdFor.cell('1', 'value')).toContainText('8');
        // Row 3 'Sum A': ctx.sum('a') = 1+2+3+4+5+6+7 => 28 (from RHS grid).
        await expect(agIdFor.cell('3', 'value')).toContainText('28');
        // Row 4 'Sum B': ctx.sum('b') = 22+33+44+55+66+77+88 => 385 (from RHS grid).
        await expect(agIdFor.cell('4', 'value')).toContainText('385');
    });

    test.typescript('Changing the context number refreshes expression cells', async ({ page, agIdFor }) => {
        // Sanity check the starting values before changing the number.
        await expect(agIdFor.cell('0', 'value')).toContainText('16');

        // The text input calls onNewNumber, which updates ctx.theNumber and refreshes cells.
        const input = page.locator('input[type="text"]').first();
        await input.fill('5');

        // Row 0 'Number Squared': 5 * 5 => 25. Row 1 'Number x 2': 5 * 2 => 10.
        await expect(agIdFor.cell('0', 'value')).toContainText('25');
        await expect(agIdFor.cell('1', 'value')).toContainText('10');
    });
});
