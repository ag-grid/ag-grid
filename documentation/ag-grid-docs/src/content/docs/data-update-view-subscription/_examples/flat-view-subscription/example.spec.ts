import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Rows in view are subscribed on load, scroll and when enabled, and unsubscribed on scroll and when disabled',
        async ({ page }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            // the rows that leave the view are unsubscribed, so the count stays below the number of rows in view
            await scrollGridRelative('element', page, { y: 1500 });
            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);

            await subscriptionCheckbox.uncheck();
            await expect(count).toHaveText('0');
            // no rows are subscribed, so the updates sent count starts again
            await expect(page.locator('#updatesSent')).toHaveText('0');

            await subscriptionCheckbox.check();
            await expect(count).not.toHaveText('0');
        }
    );
});
