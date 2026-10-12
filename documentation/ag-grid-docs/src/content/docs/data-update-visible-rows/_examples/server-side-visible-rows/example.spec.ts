import { expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Visible rows are subscribed on load, scroll and start, and unsubscribed on purge and stop',
        async ({ page }) => {
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => logs.push(msg.text()));
            const expectLogged = (text: string) =>
                expect(() => expect(logs.some((l) => l.includes(text))).toBe(true)).toPass();

            const count = page.locator('#subscribedCount');
            const toggle = page.locator('#toggleStream');

            await expect(count).not.toHaveText('0');
            expect(Number(await count.textContent())).toBeLessThan(40);

            await scrollGridRelative('element', page, { y: 1500 });
            await expectLogged('(scroll)');

            await page.getByRole('button', { name: 'Purge' }).click();
            await expectLogged('unsubscribe');
            await expectLogged('(reset)');
            await expectLogged('(load)');
            await expect(count).not.toHaveText('0');

            await toggle.click();
            await expectLogged('(stop)');
            await expect(count).toHaveText('0');
            await expect(toggle).toHaveText('Start');

            await toggle.click();
            await expectLogged('(initial)');
            await expect(count).not.toHaveText('0');
            await expect(toggle).toHaveText('Stop');
        }
    );
});
