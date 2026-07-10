import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('BigInt equals filter matches exact value without precision loss', async ({ page, agIdFor }) => {
        // 9007199254740993n and 9007199254740995n both exceed Number.MAX_SAFE_INTEGER (2^53 - 1)
        // and would be indistinguishable as JS numbers. The BigInt Filter keeps them distinct.
        const filterButton = agIdFor.headerFilterButton('ledgerId');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('9007199254740995');

        // close the filter by clicking the matching cell
        await agIdFor.cell('1', 'account').click();

        // Bravo is the exact match; Alpha (differs only in the final digit) is excluded.
        await expect(agIdFor.cell('1', 'account')).toHaveText('Bravo');
        await expect(agIdFor.cell('1', 'ledgerId')).toContainText('9007199254740995');
        await expect(agIdFor.cell('0', 'account')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'account')).not.toBeVisible();
    });

    test.eachFramework('BigInt greater-than filter on explicitly configured column', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('balance');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        const picker = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });
        await picker.click();
        await page.getByText('Greater than', { exact: true }).click();

        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('45000000000000000');

        await agIdFor.cell('4', 'account').click();

        // Echo (1e17) and Foxtrot (1.1e17) exceed the threshold; Delta (equal to it) is excluded.
        await expect(agIdFor.cell('4', 'account')).toHaveText('Echo');
        await expect(agIdFor.cell('5', 'account')).toHaveText('Foxtrot');
        await expect(agIdFor.cell('3', 'account')).not.toBeVisible();
        await expect(agIdFor.cell('0', 'account')).not.toBeVisible();
    });
});
