import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0: Alice, weight 68, height 165. BMI = 68 / (1.65^2) = 24.98.
    test.eachFramework('displays the source data with the computed BMI', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'name')).toContainText('Alice');
        await expect(agIdFor.cell('0', 'weight')).toContainText('68');
        await expect(agIdFor.cell('0', 'height')).toContainText('165');
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });

    test.eachFramework('full row edit recomputes the BMI on commit', async ({ agIdFor, page }) => {
        // Double-clicking any cell opens editors across the whole row (editType: 'fullRow').
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        await expect(weightInput).toBeVisible();
        // 80 / (1.65^2) = 29.38, within the valid BMI range of 10..80.
        await weightInput.fill('80');
        await weightInput.press('Enter');

        await expect(agIdFor.cell('0', 'weight')).toContainText('80');
        await expect(agIdFor.cell('0', '0')).toContainText('29.38');
    });

    test.eachFramework('block mode keeps the row open when the BMI is invalid', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        await expect(weightInput).toBeVisible();
        // 5 / (1.65^2) = 1.84, below the minimum BMI of 10 => full-row validation fails.
        await weightInput.fill('5');
        await weightInput.press('Enter');

        // invalidEditValueMode 'block' keeps the row editors open.
        await expect(weightInput).toBeVisible();

        // The unchanged BMI still reflects the original value.
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });

    test.eachFramework('block mode keeps the row open when the BMI cannot be calculated', async ({ agIdFor }) => {
        await agIdFor.cell('0', 'height').dblclick();

        const heightInput = agIdFor.cell('0', 'height').locator('input');
        await expect(heightInput).toBeVisible();
        // Zero is within the editor's configured range, but it cannot produce a finite BMI.
        await heightInput.fill('0');
        await heightInput.press('Enter');

        await expect(heightInput).toBeVisible();
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });
    test.eachFramework('the BMI column is not editable during a full row edit', async ({ agIdFor }) => {
        // The BMI column is a valueGetter column declared `editable: false`, so opening the row
        // must not give it an editor even though every other cell in the row gets one.
        await agIdFor.cell('0', 'weight').dblclick();

        await expect(agIdFor.cell('0', 'weight').locator('input')).toBeVisible();
        await expect(agIdFor.cell('0', 'name').locator('input')).toBeVisible();
        await expect(agIdFor.cell('0', 'height').locator('input')).toBeVisible();
        await expect(agIdFor.cell('0', '0').locator('input')).toHaveCount(0);
    });

    test.eachFramework('block mode holds the row on a per-cell max, not the row rule', async ({ agIdFor }) => {
        // Documented claim: "the Grid will validate each cell editor in the row individually".
        // Weight max is 500. 501 with height 300 gives BMI 55.67, which the row rule accepts,
        // so only the cell constraint can be what blocks the edit.
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        const heightInput = agIdFor.cell('0', 'height').locator('input');
        await expect(weightInput).toBeVisible();

        await heightInput.fill('300');
        await weightInput.fill('501');
        await weightInput.press('Enter');

        await expect(weightInput).toBeVisible();
        await expect(agIdFor.cell('0', 'weight')).toHaveClass(/ag-cell-editing-error/);
        await expect(agIdFor.cell('0', 'height')).not.toHaveClass(/ag-cell-editing-error/);
    });

    test.eachFramework('block mode holds the row on the height per-cell max', async ({ agIdFor }) => {
        // Height max is 300. 301 with weight 250 gives BMI 27.6, accepted by the row rule.
        await agIdFor.cell('0', 'height').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        const heightInput = agIdFor.cell('0', 'height').locator('input');
        await expect(heightInput).toBeVisible();

        await weightInput.fill('250');
        await heightInput.fill('301');
        await heightInput.press('Enter');

        await expect(heightInput).toBeVisible();
        await expect(agIdFor.cell('0', 'height')).toHaveClass(/ag-cell-editing-error/);
        await expect(agIdFor.cell('0', 'weight')).not.toHaveClass(/ag-cell-editing-error/);
    });

    test.eachFramework('block mode holds the row when the BMI is above the maximum', async ({ agIdFor }) => {
        // The row rule's upper branch: 250 / (1.65^2) = 91.83, above the documented maximum of 80.
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        await expect(weightInput).toBeVisible();
        await weightInput.fill('250');
        await weightInput.press('Enter');

        await expect(weightInput).toBeVisible();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-editing-invalid/);
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });

    test.eachFramework(
        'shows the row validation error messages on the open editors',
        async ({ agIdFor, page, agFramework }) => {
            // getFullRowEditValidationErrors returns user-facing strings, which the Grid surfaces in a
            // tooltip on the editor. Row-level errors are not written to the input's validity message
            // (only cell-level ones are), so the tooltip is the only place they are observable.
            // The tooltip does not settle on the React development build.
            test.skip(agFramework.startsWith('react'), 'Tooltip does not settle on the React dev build');

            const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

            await agIdFor.cell('0', 'weight').dblclick();
            const weightInput = agIdFor.cell('0', 'weight').locator('input');
            await expect(weightInput).toBeVisible();

            // Above the maximum: `BMI is ${bmi.toFixed(2)}. It must be between 10 and 80. Check Weight and Height.`
            await weightInput.fill('250');
            await weightInput.hover();
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toContainText('BMI is 91.83. It must be between 10 and 80. Check Weight and Height.');

            // Non-finite BMI: 'BMI cannot be calculated. Enter valid Weight and Height values.'
            const heightInput = agIdFor.cell('0', 'height').locator('input');
            await weightInput.fill('68');
            await heightInput.fill('0');
            await heightInput.hover();
            await expect(tooltip).toContainText('BMI cannot be calculated. Enter valid Weight and Height values.');
        }
    );

    test.eachFramework('Tab still moves between editors while the row is blocked', async ({ agIdFor, page }) => {
        // Documented claim: "Full Row Editing still allows navigation between editors in the same row."
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        const heightInput = agIdFor.cell('0', 'height').locator('input');
        await expect(weightInput).toBeVisible();

        // 5 / (1.65^2) = 1.84, below the minimum BMI of 10, so the row is blocked.
        await weightInput.fill('5');
        await weightInput.press('Enter');
        await expect(weightInput).toBeVisible();

        await weightInput.press('Tab');
        await expect(heightInput).toBeFocused();

        // The row is still open and still blocked after navigating.
        await expect(weightInput).toBeVisible();
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });

    test.eachFramework('Escape cancels a blocked row edit', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'weight').dblclick();

        const weightInput = agIdFor.cell('0', 'weight').locator('input');
        await expect(weightInput).toBeVisible();
        await weightInput.fill('5');
        await weightInput.press('Enter');
        await expect(weightInput).toBeVisible();

        await page.keyboard.press('Escape');

        await expect(weightInput).toHaveCount(0);
        await expect(agIdFor.cell('0', 'weight')).toContainText('68');
        await expect(agIdFor.cell('0', 'height')).toContainText('165');
        await expect(agIdFor.cell('0', '0')).toContainText('24.98');
    });
});
