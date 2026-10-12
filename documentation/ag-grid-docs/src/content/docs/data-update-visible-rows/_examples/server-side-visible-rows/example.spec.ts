import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Visible rows are subscribed on load, scroll and start, and unsubscribed on purge and stop',
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
