import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Loaded rows in view are subscribed on load, scroll and when enabled, and unsubscribed when disabled',
        async ({ page }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const updatesSent = page.locator('#updatesSent');
            const subscriptionToggle = page.locator('.subscription-toggle');
            const subscriptionCheckbox = subscriptionToggle.getByRole('checkbox');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(updatesSent).not.toHaveText('0');

            // rows further down load in a new block, and are subscribed once it has loaded
            await scrollGridRelative('element', page, { y: 5000 });
            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);

            await subscriptionCheckbox.uncheck();
            await expect(subscriptionToggle).toHaveText('Subscription disabled');
            await expect(count).toHaveText('0');

            await subscriptionCheckbox.check();
            await expect(subscriptionToggle).toHaveText('Subscription active');
            await expect(count).not.toHaveText('0');
        }
    );
});
