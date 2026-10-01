import { expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Row 0 of olympic-winners.json: Michael Phelps, age 23.
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('revert mode discards an out-of-range edit', async ({ agIdFor, page }) => {
        // Default mode is 'revert'. Age max is 100 so 200 is invalid and the cell reverts to 23.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('200');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('23');
    });

    test.eachFramework('commits a valid edit in the default mode', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('42');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('42');
    });
    test.eachFramework(
        'block mode keeps the invalid editor open until a valid value is entered',
        async ({ agIdFor, page }) => {
            // Documented claim: 'block' "Keeps the invalid editing session open until a valid value is provided".
            const cell = agIdFor.cell('0', 'age');
            await expect(cell).toContainText('23');

            await page.locator('#select-validation-mode').selectOption('block');

            await cell.dblclick();
            await expect(editInput(page)).toBeVisible();
            await editInput(page).fill('200');
            await editInput(page).press('Enter');

            // The editor stays open and still holds the rejected value, so the edit never completed.
            await expect(editInput(page)).toBeVisible();
            await expect(editInput(page)).toHaveValue('200');

            // Supplying a valid value completes the same editing session.
            await editInput(page).fill('50');
            await editInput(page).press('Enter');

            await expect(editInput(page)).toHaveCount(0);
            await expect(cell).toContainText('50');
        }
    );

    test.eachFramework('block mode edit can still be cancelled with Escape', async ({ agIdFor, page }) => {
        // Documented claim: a blocked session stays open "until a valid value is provided or the edit is cancelled".
        const cell = agIdFor.cell('0', 'age');
        await expect(cell).toContainText('23');

        await page.locator('#select-validation-mode').selectOption('block');

        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('200');
        await editInput(page).press('Enter');
        await expect(editInput(page)).toBeVisible();

        await editInput(page).press('Escape');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('23');
    });
});
