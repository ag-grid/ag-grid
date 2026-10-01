import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0 from data.ts: Alice Johnson, (415) 555-1234.
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'name')).toContainText('Alice Johnson');
        await expect(agIdFor.cell('0', 'phone')).toContainText('(415) 555-1234');
    });

    test.eachFramework('custom phone editor commits a well-formatted number', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'phone');
        await cell.dblclick();

        const input = page.locator('input.phone-cell-editor');
        await expect(input).toBeVisible();
        await input.fill('(999) 555-0000');
        await input.press('Enter');

        await expect(cell).toContainText('(999) 555-0000');
    });

    test.eachFramework('custom phone editor reverts an invalid number', async ({ agIdFor, page }) => {
        // The phone editor validates against a strict (123) 456-7890 pattern.
        // '123' is invalid, so the default revert mode discards it back to the original value.
        const cell = agIdFor.cell('0', 'phone');
        await cell.dblclick();

        const input = page.locator('input.phone-cell-editor');
        await expect(input).toBeVisible();
        await input.fill('123');
        await input.press('Enter');

        await expect(cell).toContainText('(415) 555-1234');
    });
    test.eachFramework('validates during typing without leaving the editor', async ({ agIdFor, page }) => {
        // Documented claim: calling `cellEditorParams.validate()` is "useful if you want to validate
        // input during editing, such as in response to an onInput event in the Custom Phone Editor".
        const cell = agIdFor.cell('0', 'phone');
        await cell.dblclick();

        const input = page.locator('input.phone-cell-editor');
        await expect(input).toBeVisible();

        // Partial input flags the validation element returned by getValidationElement().
        await input.fill('123');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        await expect
            .poll(() => input.evaluate((el: HTMLInputElement) => el.validationMessage))
            .toBe('Invalid phone format. Use (123) 456-7890');

        // Completing the number clears the error, still without closing the editor.
        await input.fill('(123) 456-7890');
        await expect(input).toHaveAttribute('aria-invalid', 'false');
        await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.validationMessage)).toBe('');
        await expect(input).toBeVisible();
    });

    test.eachFramework('validates on blur when the editor loses focus', async ({ agIdFor, page }) => {
        // The editor also calls params.validate() from its blur handler.
        const cell = agIdFor.cell('0', 'phone');
        const input = page.locator('input.phone-cell-editor');

        // A valid number entered and then blurred by clicking away commits.
        await cell.dblclick();
        await expect(input).toBeVisible();
        await input.fill('(999) 555-0000');
        await agIdFor.cell('2', 'name').click();

        await expect(input).toHaveCount(0);
        await expect(cell).toContainText('(999) 555-0000');

        // An invalid number blurred the same way is discarded by the default 'revert' mode.
        await cell.dblclick();
        await expect(input).toBeVisible();
        await input.fill('123');
        await agIdFor.cell('2', 'name').click();

        await expect(input).toHaveCount(0);
        await expect(cell).toContainText('(999) 555-0000');
    });
});
