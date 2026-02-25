import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Alice is expanded (groupDefaultExpanded: 1)
        await expect(agIdFor.autoGroupCell('0')).toContainText('Alice Johnson', { useInnerText: true });
        await expect(agIdFor.cell('0', 'employeeId')).toContainText('1');

        // Children visible under Alice
        await expect(agIdFor.autoGroupCell('1')).toContainText('Bob Stevens', { useInnerText: true });
        await expect(agIdFor.cell('1', 'employeeId')).toContainText('2');

        await expect(agIdFor.autoGroupCell('2')).toContainText('Bob Stevens', { useInnerText: true });
        await expect(agIdFor.cell('2', 'employeeId')).toContainText('3');

        await expect(agIdFor.autoGroupCell('3')).toContainText('Jessica Adams', { useInnerText: true });
        await expect(agIdFor.cell('3', 'employeeId')).toContainText('4');
    });
});
