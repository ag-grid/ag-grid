import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Rows in view are subscribed on load, scroll and when enabled, and unsubscribed on scroll and when disabled',
        async ({ page }) => {
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => logs.push(msg.text()));
            const expectLogged = (prefix: string) =>
                expect(() => expect(logs.some((l) => l.startsWith(prefix))).toBe(true)).toPass();

            const count = page.locator('#subscribedCount');
            const subscriptionToggle = page.locator('.subscription-toggle');
            const subscriptionCheckbox = subscriptionToggle.getByRole('checkbox');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            logs.length = 0;
            await scrollGridRelative('element', page, { y: 1500 });
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');

            logs.length = 0;
            await subscriptionCheckbox.uncheck();
            await expect(subscriptionToggle).toHaveText('Subscription disabled');
            await expectLogged('unsubscribe ');
            await expect(count).toHaveText('0');

            logs.length = 0;
            await subscriptionCheckbox.check();
            await expect(subscriptionToggle).toHaveText('Subscription active');
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');
        }
    );
});
