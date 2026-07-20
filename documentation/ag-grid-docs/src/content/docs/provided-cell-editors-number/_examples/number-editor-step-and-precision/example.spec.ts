import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // agNumberCellEditor with precision: 2, step: 0.25, showStepperButtons: true. Data is the row index.
    test.eachFramework('the editor exposes the configured step and stepper buttons', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('4', 'number').dblclick();

        await expect(editInput(page)).toBeVisible();
        // step: 0.25 is applied as the input's step attribute.
        await expect(editInput(page)).toHaveAttribute('step', '0.25');
        // showStepperButtons: true adds the stepper class to the input.
        await expect(editInput(page)).toHaveClass(/ag-number-field-input-stepper/);
    });

    test.eachFramework('the up arrow steps the value by 0.25', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Cell '4' starts at 4. Stepping up by 0.25 gives 4.25 (2 decimal places, matching precision).
        const cell = agIdFor.cell('4', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).press('ArrowUp');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('4.25');
    });
});
