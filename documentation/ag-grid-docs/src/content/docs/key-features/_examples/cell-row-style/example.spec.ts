import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Applies cellClassRules to electric cells and rowClassRules to Ford rows',
        async ({ agIdFor, page }) => {
            // cellClassRules: electric === true (Tesla, row 0) gets the rag-green class
            await expect(agIdFor.cell('0', 'electric').locator('input[type="checkbox"]')).toBeChecked();
            await expect(agIdFor.cell('0', 'electric')).toHaveClass(/rag-green/);
            // electric === false (Ford, row 1) does not get rag-green
            await expect(agIdFor.cell('1', 'electric').locator('input[type="checkbox"]')).not.toBeChecked();
            await expect(agIdFor.cell('1', 'electric')).not.toHaveClass(/rag-green/);

            // rowClassRules: Ford rows get the rag-red class (row index 1 is Ford F-Series)
            await expect(agIdFor.cell('1', 'make')).toContainText('Ford');
            await expect(agIdFor.rowNode('1')).toHaveClass(/rag-red/);
            // Non-Ford row (Tesla, index 0) is not red
            await expect(agIdFor.rowNode('0')).not.toHaveClass(/rag-red/);
        }
    );
});
