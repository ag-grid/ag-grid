import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom count panel reports the displayed row count', async ({ page }) => {
        await ensureGridReady(page);

        // CountStatusBarComponent renders api.getDisplayedRowCount(); there are 14 rows.
        const countPanel = page.locator('.ag-status-name-value').filter({ hasText: 'Row Count Component' });
        await expect(countPanel).toContainText('14');
    });

    test.eachFramework('custom button logs the selected row count', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Select two rows so the custom button reports a known count.
        await agIdFor.selectionColumnCheckbox('0').click();
        await agIdFor.selectionColumnCheckbox('1').click();

        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await page.getByRole('button', { name: 'Click Me' }).click();

        await expect(() => {
            expect(logs.some((l) => l.includes('Selected Row Count: 2'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });
});
