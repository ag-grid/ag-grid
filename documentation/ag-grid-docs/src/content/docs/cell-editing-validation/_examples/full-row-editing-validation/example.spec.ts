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
});
