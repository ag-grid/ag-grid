import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should include an unchanged value in the custom sequence', async ({ agIdFor }) => {
        const sourceCell = agIdFor.cell('0', 'value');
        await sourceCell.click();

        const fillHandle = agIdFor.fillHandle();
        await expect(fillHandle).toBeVisible();
        await dragFillHandleOverTo(fillHandle, agIdFor.cell('4', 'value'));

        await expect(agIdFor.cell('0', 'value')).toHaveText('10');
        await expect(agIdFor.cell('1', 'value')).toHaveText('20');
        await expect(agIdFor.cell('2', 'value')).toHaveText('30');
        await expect(agIdFor.cell('3', 'value')).toHaveText('40');
        await expect(agIdFor.cell('4', 'value')).toHaveText('50');
    });
});
