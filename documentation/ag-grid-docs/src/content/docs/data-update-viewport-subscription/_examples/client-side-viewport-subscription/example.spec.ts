import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Rows in view are subscribed on scroll and start, and unsubscribed on new row data and stop',
        async ({ page }) => {
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => logs.push(msg.text()));
            const expectLogged = (prefix: string) =>
                expect(() => expect(logs.some((l) => l.startsWith(prefix))).toBe(true)).toPass();

            const count = page.locator('#subscribedCount');
            const toggle = page.locator('#toggleStream');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);
            await expect(page.locator('#updatesSent')).not.toHaveText('0');

            logs.length = 0;
            await scrollGridRelative('element', page, { y: 1500 });
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');

            logs.length = 0;
            await page.getByRole('button', { name: 'New Row Data' }).click();
            await expectLogged('unsubscribe ');
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');

            const countNow = async () => Number(await count.textContent());

            const withGroups = await countNow();
            await page.locator('#includeGroups').uncheck();
            await expect(async () => expect(await countNow()).toBeLessThan(withGroups)).toPass();

            const withoutBuffer = await countNow();
            await page.locator('#includeBuffer').check();
            await expect(async () => expect(await countNow()).toBeGreaterThan(withoutBuffer)).toPass();

            logs.length = 0;
            await toggle.click();
            await expectLogged('unsubscribe ');
            await expect(count).toHaveText('0');
            await expect(toggle).toHaveText('Start');

            logs.length = 0;
            await toggle.click();
            await expectLogged('subscribe ');
            await expect(count).not.toHaveText('0');
            await expect(toggle).toHaveText('Stop');
        }
    );
});
