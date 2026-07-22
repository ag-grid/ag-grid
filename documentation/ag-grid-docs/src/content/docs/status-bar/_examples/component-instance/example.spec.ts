import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('toggle button hides and shows the custom status panel', async ({ page }) => {
        await ensureGridReady(page);

        const panelButton = page.getByRole('button', { name: 'Click Me' });
        const toggleButton = page.getByRole('button', { name: 'Toggle Status Bar Component' });

        // The custom panel is visible on load.
        await expect(panelButton).toBeVisible();

        // getStatusPanel('statusBarCompKey').setVisible(false) hides it.
        await toggleButton.click();
        await expect(panelButton).toBeHidden();

        // Toggling again brings it back.
        await toggleButton.click();
        await expect(panelButton).toBeVisible();
    });

    test.eachFramework('custom panel button logs the selected row count', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.selectionColumnCheckbox('0').click();
        await agIdFor.selectionColumnCheckbox('1').click();
        await agIdFor.selectionColumnCheckbox('2').click();

        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await page.getByRole('button', { name: 'Click Me' }).click();

        await expect(() => {
            expect(logs.some((l) => l.includes('Selected Row Count: 3'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });
});
