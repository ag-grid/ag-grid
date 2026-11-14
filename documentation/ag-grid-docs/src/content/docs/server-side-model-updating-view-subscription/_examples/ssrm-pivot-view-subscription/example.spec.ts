import type { Locator } from '@playwright/test';
import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Waits until the count stops changing: the last updates have arrived. */
async function expectStopped(counter: Locator) {
    let last = -1;
    await expect
        .poll(
            async () => {
                const now = Number(await counter.textContent());
                const stopped = now === last;
                last = now;
                return stopped;
            },
            { intervals: [1500] }
        )
        .toBe(true);
}

/** Waits until the count grows between two reads: the server is streaming again. The count resets while no row is subscribed. */
async function expectStreaming(counter: Locator) {
    let last = Number(await counter.textContent());
    await expect
        .poll(
            async () => {
                const now = Number(await counter.textContent());
                const grew = now > last;
                last = now;
                return grew;
            },
            { intervals: [1500] }
        )
        .toBe(true);
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'Group rows loaded from the server are subscribed, receive their aggregates, and pause while no aggregate is shown',
        async ({ page, agIdFor }) => {
            // the quiet streams take a while to show each pause and resume
            test.slow();
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const updates = page.locator('#updatesSent');
            const streamed = page.locator('#streamedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            // the five sector group rows are subscribed, and the server streams each one whole
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('5');

            // the server streams the Energy row's aggregates for every exchange
            const groupRow = agIdFor.rowNode('group/Energy');
            await expect(groupRow.locator('[col-id="NYSE_volume"]')).not.toHaveText('');
            await expect(groupRow).not.toHaveText((await groupRow.textContent())!);

            // without value columns the group rows show no aggregate, so their streams pause
            await agIdFor.columnSelectListItemCheckbox('Change % Column').click();
            await agIdFor.columnSelectListItemCheckbox('Volume Column').click();
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('0');
            await expectStopped(updates);

            // a value column resumes them
            await agIdFor.columnSelectListItemCheckbox('Volume Column').click();
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('5');
            await expectStreaming(updates);
            await expect(groupRow).not.toHaveText((await groupRow.textContent())!);

            // with pivot mode off, the stocks in view are subscribed too
            await agIdFor.pivotModeSelect().click();
            await agIdFor.autoGroupContracted('group/Energy').click();
            await expect(count).not.toHaveText('5');
            const streamedColumns = ['Price Column', 'Change % Column', 'Volume Column'];
            for (const column of streamedColumns) {
                await agIdFor.columnSelectListItemCheckbox(column).click();
            }
            await expect(streamed).toHaveText('0');
            await expectStopped(updates);
            // the price streams for the stocks only, as group rows leave it blank
            await agIdFor.columnSelectListItemCheckbox('Price Column').click();
            await expect(streamed).not.toHaveText('0');
            await expectStreaming(updates);
            for (const column of streamedColumns.slice(1)) {
                await agIdFor.columnSelectListItemCheckbox(column).click();
            }
            await agIdFor.pivotModeSelect().click();
            await expect(count).toHaveText('5');

            await subscriptionCheckbox.uncheck();
            await expect(count).toHaveText('0');
            // no rows are subscribed, so the updates sent count starts again
            await expect(page.locator('#updatesSent')).toHaveText('0');
            await expect(streamed).toHaveText('0');

            await subscriptionCheckbox.check();
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('5');
            await expectStreaming(updates);
        }
    );
});
