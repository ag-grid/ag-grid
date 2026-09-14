import { expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Row 0 of olympic-winners.json: Michael Phelps, age 23.
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('reverts an athlete edit shorter than 3 characters', async ({ agIdFor, page }) => {
        // getValidationErrors requires at least 3 characters, so 'ab' is invalid and reverts.
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('ab');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('Michael Phelps');
    });

    test.eachFramework('commits a valid athlete edit', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('Jane Doe');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('Jane Doe');
    });

    test.eachFramework('reverts an age edit equal to 18', async ({ agIdFor, page }) => {
        // getValidationErrors rejects the value 18, so the edit reverts to the original 23.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('18');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('23');
    });
    test.eachFramework('reverts an emptied athlete value', async ({ agIdFor, page }) => {
        // getValidationErrors rejects `!value`, not just short values.
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('Michael Phelps');
    });

    test.eachFramework('commits an athlete value of exactly 3 characters', async ({ agIdFor, page }) => {
        // The documented rule is "at least 3 characters", so 3 is the first accepted length.
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('abc');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('abc');
    });

    test.eachFramework('commits an age different than 18', async ({ agIdFor, page }) => {
        // Only the value 18 is rejected, so the neighbouring value 19 commits.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('19');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('19');
    });

    test.eachFramework(
        'surfaces the custom error messages on the open editor',
        async ({ agIdFor, page, agFramework }) => {
            // Documented claim: "If the callback returns errors, the Grid will show the errors in a tooltip
            // when hovering the editor". The same text is also set as the input's native validity message.
            const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

            await agIdFor.cell('0', 'athlete').dblclick();
            await expect(editInput(page)).toBeVisible();
            await editInput(page).fill('ab');

            await expect
                .poll(() => editInput(page).evaluate((el: HTMLInputElement) => el.validationMessage))
                .toBe('The value has to be at least 3 characters long.');

            // The hover tooltip does not settle on the React development build, so the rendered
            // tooltip is asserted on the other frameworks and the validity message above covers all.
            if (!agFramework.startsWith('react')) {
                await editInput(page).hover();
                await expect(tooltip).toBeVisible();
                await expect(tooltip).toContainText('The value has to be at least 3 characters long.');
            }

            await editInput(page).press('Escape');

            await agIdFor.cell('0', 'age').dblclick();
            await expect(editInput(page)).toBeVisible();
            await editInput(page).fill('18');

            await expect
                .poll(() => editInput(page).evaluate((el: HTMLInputElement) => el.validationMessage))
                .toBe('Value has to be different than 18');

            if (!agFramework.startsWith('react')) {
                await editInput(page).hover();
                await expect(tooltip).toContainText('Value has to be different than 18');
            }
        }
    );
});
