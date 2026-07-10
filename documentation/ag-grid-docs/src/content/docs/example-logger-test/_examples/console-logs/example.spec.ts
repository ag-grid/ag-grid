import { expect, test } from '@utils/grid/test-utils';

// The example renders one "Log" button per entry in CONSOLE_LOG_ARGS, each paired
// with a <pre> preview of the console.log() call it will make. Clicking a button
// emits the corresponding console.log.
test.agExample(import.meta, () => {
    test.eachFramework('Renders a Log button and code preview for every logging example', async ({ page }) => {
        const controls = page.locator('#controls');
        const buttons = controls.locator('button');

        // CONSOLE_LOG_ARGS has 21 entries, so 21 log controls are generated.
        await expect(buttons).toHaveCount(21);
        await expect(buttons.first()).toHaveText('Log');

        const previews = controls.locator('pre');
        // First three previews stringify their args deterministically.
        await expect(previews.nth(0)).toContainText('console.log("string")');
        await expect(previews.nth(1)).toContainText('console.log(23)');
        await expect(previews.nth(2)).toContainText('console.log(null)');
    });

    test.eachFramework('Clicking a Log button emits the console log', async ({ page }) => {
        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        // First control logs the string "string".
        await page.locator('#controls button').first().click();
        // The log arrives over CDP asynchronously; retry until the captured logs contain it.
        await expect(() => {
            expect(logs.some((l) => l.includes('string'))).toBe(true);
        }).toPass();
        page.off('console', handler);
    });
});
