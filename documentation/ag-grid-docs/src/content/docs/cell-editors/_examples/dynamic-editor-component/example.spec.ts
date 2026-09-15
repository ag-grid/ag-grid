import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Rows: 0 age/14, 1 gender/Female, 2 mood/Happy, 3 age/21, 4 gender/Male, 5 mood/Sad.
    test.eachFramework('displays the typed value rows', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'type')).toContainText('age');
        await expect(agIdFor.cell('0', 'value')).toContainText('14');
        await expect(agIdFor.cell('1', 'type')).toContainText('gender');
        await expect(agIdFor.cell('1', 'value')).toContainText('Female');
        await expect(agIdFor.cell('2', 'type')).toContainText('mood');
        await expect(agIdFor.cell('2', 'value')).toContainText('Happy');
    });

    test.eachFramework('selects the numeric editor for an age row', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'value');
        await cell.dblclick();
        // cellEditorSelector returns the custom NumericCellEditor for type === 'age'.
        const input = cell.locator('input.simple-input-editor').first();
        await expect(input).toBeVisible();
        await input.fill('30');
        await input.press('Enter');
        await expect(cell).toContainText('30');
    });

    test.eachFramework('selects the popup mood editor for a mood row', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('2', 'value');
        await cell.dblclick();
        // cellEditorSelector returns the custom MoodEditor (popup) for type === 'mood'.
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();
        // Two smiley images are offered for selection.
        await expect(popupEditor.locator('img')).toHaveCount(2);
    });

    // cellEditorSelector returns the provided Rich Select editor for type === 'gender'.
    test.eachFramework('selects the rich select editor for a gender row', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('1', 'value');
        await expect(cell).toContainText('Female');

        await cell.dblclick();
        const rows = page.locator('.ag-rich-select-row');
        await expect(rows).toHaveCount(2);

        await rows
            .filter({ hasText: /^Male$/ })
            .first()
            .click();
        await expect(cell).toHaveText('Male');
    });

    // Clicking a smiley in the mood popup selects it and stops editing.
    test.eachFramework('clicking a smiley in the mood popup commits the value', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('2', 'value');
        await expect(cell).toHaveText('Happy');

        await cell.dblclick();
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();
        await popupEditor.locator('img').nth(1).click();

        await expect(cell).toHaveText('Sad');
    });

    // The mood editor is configured with popupPosition: 'under', so it sits below the cell.
    test.eachFramework('the mood popup opens under the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('2', 'value');
        const cellBox = await cell.boundingBox();

        await cell.dblclick();
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();

        const popupBox = await popupEditor.boundingBox();
        expect(popupBox!.y).toBeGreaterThan(cellBox!.y + cellBox!.height - 5);

        await page.keyboard.press('Escape');
    });

    // NumericCellEditor.isCancelBeforeStart stops a letter key from starting the edit.
    test.eachFramework(
        'a letter key does not start the numeric editor',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'value');
            await cell.click();
            await page.keyboard.press('a');

            // React mounts the editor before isCancelBeforeStart is consulted, so the editor element can
            // appear briefly; what the claim guarantees on every framework is that no edit takes effect.
            // Mounting it with Number('a') also makes the React development build warn about a NaN value -
            // a defect in the React example rather than in the grid, so the warning is opted into here.
            await expect(cell).toHaveText('14');
        },
        { allowedConsoleMessages: ['Received NaN for the `%s` attribute'] }
    );

    // NumericCellEditor.isCancelAfterEnd rejects a value containing '007'. Only the vanilla/typescript
    // version of this example implements that rule - the React, Angular and Vue editors reject values
    // over 1,000,000 instead - so this is asserted on those two frameworks only.
    const rejectsDoubleOhSeven = (frameworkTest: any) => {
        frameworkTest('isCancelAfterEnd rejects a value containing 007', async ({ agIdFor }: any) => {
            const cell = agIdFor.cell('0', 'value');
            await cell.dblclick();

            const input = cell.locator('input.simple-input-editor').first();
            await input.fill('1007');
            await input.press('Enter');

            await expect(cell).toHaveText('14');
        });
    };

    rejectsDoubleOhSeven(test.typescript);
    rejectsDoubleOhSeven(test.vanilla);
});
