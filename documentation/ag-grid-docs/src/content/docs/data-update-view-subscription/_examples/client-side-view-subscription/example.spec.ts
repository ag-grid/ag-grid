import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Rows in view are subscribed on scroll and when enabled, and unsubscribed on new row data and when disabled',
        async ({ page }) => {
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => logs.push(msg.text()));
            const expectLogged = (prefix: string) =>
                expect(() => expect(logs.some((l) => l.startsWith(prefix))).toBe(true)).toPass();

            const count = page.locator('#subscribedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            // only the stocks in view are subscribed, and the group rows are skipped
            const countStocksInView = () =>
                page.evaluate(() => {
                    const viewport = document.querySelector('.ag-grid-viewport')!.getBoundingClientRect();
                    const top = Math.max(
                        viewport.top,
                        document.querySelector('.ag-header')!.getBoundingClientRect().bottom
                    );
                    const ids = new Set<string>();
                    document.querySelectorAll<HTMLElement>('.ag-row[row-id]').forEach((row) => {
                        const rect = row.getBoundingClientRect();
                        const id = row.getAttribute('row-id')!;
                        if (!id.startsWith('row-group-') && rect.bottom > top && rect.top < viewport.bottom) {
                            ids.add(id);
                        }
                    });
                    return ids.size;
                });
            await expect(async () =>
                expect(Number(await count.textContent())).toBe(await countStocksInView())
            ).toPass();

            // the stocks in view update as the server streams them
            const stockVolumes = page.locator('.ag-row:not(.ag-row-group) [col-id="volume"]');
            const volumesBefore = (await stockVolumes.allTextContents()).join();
            await expect(async () =>
                expect((await stockVolumes.allTextContents()).join()).not.toBe(volumesBefore)
            ).toPass();

            logs.length = 0;
            await scrollGridRelative('element', page, { y: 1500 });
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');

            logs.length = 0;
            await page.getByRole('button', { name: 'New Row Data' }).click();
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');
            // updates for the replaced stocks can arrive before they are unsubscribed, and must be ignored
            expect(logs.filter((l) => l.includes('Could not find row'))).toEqual([]);

            logs.length = 0;
            await subscriptionCheckbox.uncheck();
            await expectLogged('unsubscribe ');
            await expect(count).toHaveText('0');
            // no rows are subscribed, so the updates sent count starts again
            await expect(page.locator('#updatesSent')).toHaveText('0');

            logs.length = 0;
            await subscriptionCheckbox.check();
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');
        }
    );
});
