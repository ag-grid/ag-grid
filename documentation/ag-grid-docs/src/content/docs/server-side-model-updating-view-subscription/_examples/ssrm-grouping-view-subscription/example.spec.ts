import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Group rows are subscribed on load, their stocks once a group is expanded, and every row is unsubscribed when disabled',
        async ({ page, agIdFor }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            // the five collapsed sector rows are in view
            await expect(count).toHaveText('5');
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            // expanding a sector loads its stocks, which are subscribed once loaded
            await agIdFor.autoGroupContracted('sector/Energy').click();
            await expect(async () => expect(Number(await count.textContent())).toBeGreaterThan(5)).toPass();

            await subscriptionCheckbox.uncheck();
            await expect(count).toHaveText('0');
            // no rows are subscribed, so the updates sent count starts again
            await expect(page.locator('#updatesSent')).toHaveText('0');

            await subscriptionCheckbox.check();
            await expect(count).not.toHaveText('0');
        }
    );
});
