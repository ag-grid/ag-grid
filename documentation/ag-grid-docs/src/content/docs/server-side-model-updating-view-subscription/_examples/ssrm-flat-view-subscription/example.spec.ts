import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Loaded rows in view are subscribed on load, scroll and when enabled, and unsubscribed when disabled',
        async ({ page }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const updatesSent = page.locator('#updatesSent');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(updatesSent).not.toHaveText('0');

            // rows further down load in a new block, and are subscribed once it has loaded
            await scrollGridRelative('element', page, { y: 5000 });
            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);

            await subscriptionCheckbox.uncheck();
            await expect(count).toHaveText('0');
            // updates already on their way still reach rows in the grid, then no more arrive
            await page.waitForTimeout(500);
            const updatesAfterUnsubscribe = await updatesSent.textContent();
            await page.waitForTimeout(1000);
            await expect(updatesSent).toHaveText(updatesAfterUnsubscribe!);

            await subscriptionCheckbox.check();
            await expect(count).not.toHaveText('0');
        }
    );
});
