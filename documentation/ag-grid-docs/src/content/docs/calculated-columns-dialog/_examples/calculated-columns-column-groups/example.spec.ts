import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('calculated columns work with duplicate headers under column groups', async ({ agIdFor }) => {
        await expect(agIdFor.headerCell('total_2025')).toContainText('Total');
        await expect(agIdFor.headerCell('total_2026')).toContainText('Total');
        await expect(agIdFor.headerCell('q4_2025')).not.toBeVisible();
        await expect(agIdFor.headerCell('q4_2026')).not.toBeVisible();

        const q4ChangeHeader = agIdFor.headerCell('q4Change');
        const yearChangeHeader = agIdFor.headerCell('yearChange');
        const total2025Header = agIdFor.headerCell('total_2025');
        const total2026Header = agIdFor.headerCell('total_2026');
        await expect(q4ChangeHeader).toContainText('Q4 Change');
        await expect(yearChangeHeader).toContainText('Year Change');
        await expect(q4ChangeHeader).toHaveClass(/ag-calculated-column/);
        await expect(yearChangeHeader).toHaveClass(/ag-calculated-column/);
        await expect(total2025Header).toHaveClass(/ag-calculated-column/);
        await expect(total2026Header).toHaveClass(/ag-calculated-column/);

        // Collapsed year-group totals.
        await expect(agIdFor.cell('0', 'total_2025')).toContainText('$159,000');
        await expect(agIdFor.cell('0', 'total_2026')).toContainText('$211,000');
        await expect(agIdFor.cell('1', 'total_2025')).toContainText('$85,000');
        await expect(agIdFor.cell('1', 'total_2026')).toContainText('$108,000');

        // q4Change = ((q4_2026 - q4_2025) / q4_2025) * 100
        await expect(agIdFor.cell('0', 'q4Change')).toContainText('31.8%');
        await expect(agIdFor.cell('1', 'q4Change')).toContainText('24%');
        await expect(agIdFor.cell('2', 'q4Change')).toContainText('33.3%');
        await expect(agIdFor.cell('3', 'q4Change')).toContainText('28.6%');

        // yearChange compares the sum of the four 2026 quarters with the sum of the four 2025 quarters.
        await expect(agIdFor.cell('0', 'yearChange')).toContainText('$52,000');
        await expect(agIdFor.cell('1', 'yearChange')).toContainText('$23,000');
        await expect(agIdFor.cell('2', 'yearChange')).toContainText('$48,000');
        await expect(agIdFor.cell('3', 'yearChange')).toContainText('$32,000');
    });
});
