import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'chained calculated columns evaluate profit, margin and status with the ag-calculated-column class',
        async ({ agIdFor }) => {
            const profitHeader = agIdFor.headerCell('profit');
            const marginHeader = agIdFor.headerCell('margin');
            const statusHeader = agIdFor.headerCell('status');
            await expect(profitHeader).toContainText('Profit');
            await expect(marginHeader).toContainText('Margin');
            await expect(statusHeader).toContainText('Status');
            await expect(profitHeader).toHaveClass(/ag-calculated-column/);
            await expect(marginHeader).toHaveClass(/ag-calculated-column/);
            await expect(statusHeader).toHaveClass(/ag-calculated-column/);

            // profit = revenue - cost (currency-formatted)
            await expect(agIdFor.cell('0', 'profit')).toContainText('$73,000');
            await expect(agIdFor.cell('1', 'profit')).toContainText('$35,000');
            await expect(agIdFor.cell('2', 'profit')).toContainText('$75,000');
            await expect(agIdFor.cell('3', 'profit')).toContainText('$40,000');
            await expect(agIdFor.cell('4', 'profit')).toContainText('$84,000');

            // margin = profit / revenue, displayed as Math.round(value * 100) + '%'
            // Northwind: 73000/245000 ≈ 0.2980 → 30%
            // Summit:    35000/186000 ≈ 0.1882 → 19%
            // Pioneer:   75000/214000 ≈ 0.3505 → 35%
            // Apex:      40000/198000 ≈ 0.2020 → 20%
            // Blue River: 84000/276000 ≈ 0.3043 → 30%
            await expect(agIdFor.cell('0', 'margin')).toContainText('30%');
            await expect(agIdFor.cell('1', 'margin')).toContainText('19%');
            await expect(agIdFor.cell('2', 'margin')).toContainText('35%');
            await expect(agIdFor.cell('3', 'margin')).toContainText('20%');
            await expect(agIdFor.cell('4', 'margin')).toContainText('30%');

            // status = IF(margin >= 0.25, "Healthy", "Review")
            await expect(agIdFor.cell('0', 'status')).toContainText('Healthy');
            await expect(agIdFor.cell('1', 'status')).toContainText('Review');
            await expect(agIdFor.cell('2', 'status')).toContainText('Healthy');
            await expect(agIdFor.cell('3', 'status')).toContainText('Review');
            await expect(agIdFor.cell('4', 'status')).toContainText('Healthy');
        }
    );
});
