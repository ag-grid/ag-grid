import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom detail with refresh', async ({ agIdFor, page }) => {
        // All master rows are expanded (groupDefaultExpanded: 1). The first row (Nora Thomas)
        // is the one whose data is updated on an interval; its detail row id is "detail_0".
        await expect(agIdFor.cell('0', 'name')).toContainText('Nora Thomas');

        const detail = page.locator('[row-id="detail_0"]');
        await expect(detail).toContainText('Calls:');
        await expect(detail).toContainText('Last Updated:');

        // The example applies a transaction update to the first row every 2s, which triggers
        // refresh() on its detail cell renderer (returning true so the component updates in place
        // rather than being destroyed and recreated). The rendered call count increases over time.
        const callsInput = detail.locator('input').first();
        const before = Number(await callsInput.inputValue());
        expect(before).toBeGreaterThanOrEqual(24);

        await page.waitForTimeout(2500);
        const after = Number(await callsInput.inputValue());
        expect(after).toBeGreaterThan(before);
    });
});
