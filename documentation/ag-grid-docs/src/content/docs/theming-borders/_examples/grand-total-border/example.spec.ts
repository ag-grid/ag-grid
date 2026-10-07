import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grand total row draws a border line over the row above', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'gold').first()).toContainText('3143');

        const grandTotalRow = page.locator('.ag-row-grand-total').first();
        const line = await grandTotalRow.evaluate((row) => {
            const before = getComputedStyle(row, '::before');
            const lineTop = row.getBoundingClientRect().top + parseFloat(before.top);
            return { color: before.backgroundColor, lineTop, rowTop: row.getBoundingClientRect().top };
        });
        expect(line.color).toBe('rgb(33, 150, 243)');
        expect(line.lineTop).toBeLessThan(line.rowTop);
    });
});
