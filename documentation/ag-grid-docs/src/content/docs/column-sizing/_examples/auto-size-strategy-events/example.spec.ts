import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

// wait twice as long as the animation so we know widths have settled
async function waitForAnimation(page: Page): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(page.locator('.ag-animate-autosize')).not.toBeVisible();
}

test.agExample(import.meta, () => {
    test.eachFramework('paginationChanged re-runs the strategy', async ({ page, agIdFor, remoteGrid }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const remoteApi = remoteGrid(page, '1');
        // shrink away from the strategy's widths so a re-run is observable
        await remoteApi.setColumnWidths([{ key: 'athlete', newWidth: 90 }]);
        await waitForAnimation(page);
        expect(await getWidth(agIdFor.headerCell('athlete'))).toBeLessThan(100);

        await page.locator('.ag-paging-button[data-ref="btNext"]').click();
        await waitForAnimation(page);

        expect(await getWidth(agIdFor.headerCell('athlete'))).toBeGreaterThan(100);
    });

    test.eachFramework('columnVisible re-runs the strategy for a newly shown column', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        await page.locator('button.toggle-button').click(); // hide
        await waitForAnimation(page);
        await expect(agIdFor.headerCell('country')).toHaveCount(0);

        await page.locator('button.toggle-button').click(); // show
        await waitForAnimation(page);

        await expect(agIdFor.headerCell('country')).toBeVisible();
        // sized to its content, not left at the 80 px minWidth
        expect(await getWidth(agIdFor.headerCell('country'))).toBeGreaterThan(80);
    });

    test.eachFramework('a manual resize survives an event-driven re-run', async ({ page, agIdFor, remoteGrid }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const remoteApi = remoteGrid(page, '1');
        // 'uiColumnResized' is the source a header-handle drag reports
        await remoteApi.setColumnWidths([{ key: 'athlete', newWidth: 300 }], true, 'uiColumnResized');
        await waitForAnimation(page);

        await page.locator('.ag-paging-button[data-ref="btNext"]').click();
        await waitForAnimation(page);

        expect(await getWidth(agIdFor.headerCell('athlete'))).toBe(300);
    });

    test.eachFramework(
        'Re-Apply Strategy reclaims a manually resized column',
        async ({ page, agIdFor, remoteGrid }) => {
            await waitForGridContent(page);
            await waitForAnimation(page);

            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setColumnWidths([{ key: 'athlete', newWidth: 300 }], true, 'uiColumnResized');
            await waitForAnimation(page);

            await page.locator('button.reapply-button').click();
            await waitForAnimation(page);

            expect(await getWidth(agIdFor.headerCell('athlete'))).not.toBe(300);
        }
    );
});
