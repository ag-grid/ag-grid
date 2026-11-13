import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Group rows are subscribed, stream every stock in the group, and are unsubscribed when disabled',
        async ({ page, agIdFor }) => {
            await waitForGridContent(page);

            const count = page.locator('#subscribedCount');
            const streamed = page.locator('#streamedCount');
            const subscriptionCheckbox = page.locator('#subscriptionActive');

            // the five sector group rows are subscribed, and stream all 100 stocks
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('100');

            // the Energy group row's pivot result cells follow its stocks
            const groupRow = agIdFor.rowNode('row-group-sector-Energy');
            await expect(groupRow).not.toHaveText((await groupRow.textContent())!);

            // without value columns the group rows need no stock data, so the server stops streaming their stocks
            const updates = page.locator('#updatesSent');
            await agIdFor.columnSelectListItemCheckbox('Change % Column').click();
            await agIdFor.columnSelectListItemCheckbox('Volume Column').click();
            await expect(streamed).toHaveText('0');
            await expect(count).toHaveText('5');
            // the updates stop once the last batch arrives: poll until two reads in a row match
            let lastUpdates = -1;
            await expect
                .poll(
                    async () => {
                        const now = Number(await updates.textContent());
                        const stopped = now === lastUpdates;
                        lastUpdates = now;
                        return stopped;
                    },
                    { intervals: [1500] }
                )
                .toBe(true);

            // a value column brings the stocks back
            await agIdFor.columnSelectListItemCheckbox('Volume Column').click();
            await expect(streamed).toHaveText('100');
            await expect(groupRow).not.toHaveText((await groupRow.textContent())!);

            // with pivot mode off, the stocks in view stream too, and every stream pauses while no column shows its data
            await agIdFor.pivotModeSelect().click();
            await agIdFor.autoGroupContracted('row-group-sector-Energy').click();
            // the Energy stocks come into view, and push some sector rows out of it
            await expect(count).not.toHaveText('5');
            const streamedInView = (await streamed.textContent())!;
            const streamedColumns = ['Price Column', 'Change % Column', 'Volume Column'];
            for (const column of streamedColumns) {
                await agIdFor.columnSelectListItemCheckbox(column).click();
            }
            await expect(streamed).toHaveText('0');
            // a price column needs only the stocks in view, as the group rows leave it blank
            await agIdFor.columnSelectListItemCheckbox('Price Column').click();
            await expect(streamed).not.toHaveText('0');
            for (const column of streamedColumns.slice(1)) {
                await agIdFor.columnSelectListItemCheckbox(column).click();
            }
            await expect(streamed).toHaveText(streamedInView);
            await agIdFor.pivotModeSelect().click();

            await subscriptionCheckbox.uncheck();
            await expect(count).toHaveText('0');
            // no rows are subscribed, so the updates sent count starts again
            await expect(page.locator('#updatesSent')).toHaveText('0');
            await expect(streamed).toHaveText('0');

            await subscriptionCheckbox.check();
            await expect(count).toHaveText('5');
            await expect(streamed).toHaveText('100');
        }
    );
});
