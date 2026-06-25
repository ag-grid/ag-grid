import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'calculated columns evaluate on leaf rows; aggFunc aggregates onto groups',
        async ({ agIdFor }) => {
            const solarGroupId = 'row-group-productType-Solar';

            await expect(agIdFor.autoGroupCell(solarGroupId)).toContainText('Solar (2)', { useInnerText: true });
            await expect(agIdFor.cell(solarGroupId, 'revenue')).toContainText('$220,000');
            await expect(agIdFor.cell(solarGroupId, 'cost')).toContainText('$148,000');
            // profit has an aggFunc, so the group aggregates the per-leaf profit; margin (no aggFunc) is blank.
            await expect(agIdFor.cell(solarGroupId, 'profit')).toContainText('$72,000');
            await expect(agIdFor.cell(solarGroupId, 'margin')).toHaveText('');

            // Both calculated columns evaluate on the leaf rows.
            await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
            await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');
            await expect(agIdFor.cell('0', 'margin')).toContainText('32%');
        }
    );
});
