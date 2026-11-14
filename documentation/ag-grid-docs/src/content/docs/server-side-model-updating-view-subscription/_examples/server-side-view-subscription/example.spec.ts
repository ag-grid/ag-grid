import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Rows in view are subscribed on load, scroll and when enabled, and unsubscribed on purge and when disabled',
        async ({ page, agIdFor }) => {
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => logs.push(msg.text()));
            const expectLogged = (prefix: string) =>
                expect(() => expect(logs.some((l) => l.startsWith(prefix))).toBe(true)).toPass();

            const count = page.locator('#subscribedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);

            // the Americas row's total value follows the stocks under it
            const regionValue = agIdFor.cell('Americas', 'value');
            await expect(regionValue).not.toHaveText('');
            await expect(regionValue).not.toHaveText((await regionValue.textContent())!);

            logs.length = 0;
            await scrollGridRelative('element', page, { y: 1500 });
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');

            logs.length = 0;
            await page.getByRole('button', { name: 'Purge' }).click();
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');

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
