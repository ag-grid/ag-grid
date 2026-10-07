import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Visible rows are subscribed on load and scroll, and unsubscribed on new row data and stop',
        async ({ page }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const log = page.locator('#log');

            await expect(log).toContainText('(initial)');
            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            await page.evaluate(() => {
                const vp = document.querySelector('.ag-body-viewport') as HTMLElement;
                vp.scrollTop = 1500;
            });
            await expect(log).toContainText('(scroll)');

            await page.getByRole('button', { name: 'New Row Data' }).click();
            await expect(log).toContainText('(reset)');
            await expect(count).not.toHaveText('0');

            await page.getByRole('button', { name: 'Stop' }).click();
            await expect(log).toContainText('(stop)');
            await expect(count).toHaveText('0');
        }
    );
});
