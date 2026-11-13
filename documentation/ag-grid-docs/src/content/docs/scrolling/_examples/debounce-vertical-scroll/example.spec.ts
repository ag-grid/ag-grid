import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const scrollVerticalScrollbar = (page: Page, top: number) =>
    page.locator('.ag-body-vertical-scroll-viewport').evaluate(
        (scrollbar, scrollTop) =>
            new Promise<void>((resolve) => {
                scrollbar.addEventListener('scroll', () => resolve(), { once: true });
                scrollbar.scrollTop = scrollTop;
            }),
        top
    );

const scrollPositions = (page: Page) =>
    page.evaluate(() => ({
        scrollbar: document.querySelector('.ag-body-vertical-scroll-viewport')!.scrollTop,
        viewport: document.querySelector('.ag-grid-viewport')!.scrollTop,
    }));

async function setDebounceEnabled(page: Page, enabled: boolean) {
    const previousViewport = await page.locator('.ag-grid-viewport').elementHandle();
    const checkbox = page.getByRole('checkbox', { name: 'Debounce vertical scroll' });
    await checkbox.setChecked(enabled);
    await expect(async () => {
        expect(await previousViewport!.evaluate((element) => element.isConnected)).toBe(false);
    }).toPass();
    await previousViewport!.dispose();
    await waitForGridContent(page);
    await expect(page.locator('.ag-root-wrapper')).toHaveCount(1);
    await expect(checkbox).toBeChecked({ checked: enabled });
    expect(await scrollPositions(page)).toEqual({ scrollbar: 0, viewport: 0 });
}

async function pauseClock(page: Page, targetScrollTop: number) {
    // A recreated grid renders its rows before the frame-throttled scrollbar sizing completes.
    await expect(async () => {
        const dimensions = await page.locator('.ag-body-vertical-scroll-viewport').evaluate((scrollbar) => ({
            height: scrollbar.clientHeight,
            maxScrollTop: scrollbar.scrollHeight - scrollbar.clientHeight,
        }));
        expect(dimensions.height).toBeGreaterThan(0);
        expect(dimensions.maxScrollTop).toBeGreaterThanOrEqual(targetScrollTop);
    }).toPass();
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

test.agExample(import.meta, () => {
    test.eachFramework('restores immediate scrolling after disabling debounce', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expect(page.getByRole('checkbox', { name: 'Debounce vertical scroll' })).toBeChecked();
        await expect(agIdFor.cell('0', 'row')).toContainText('1');
        await expect(agIdFor.cell('0', 'name')).toContainText('Item 1');

        await setDebounceEnabled(page, false);

        await pauseClock(page, 4000);
        for (const top of [2000, 4000]) {
            await scrollVerticalScrollbar(page, top);
            expect(await scrollPositions(page)).toEqual({ scrollbar: top, viewport: top });
        }
        await page.clock.resume();

        await expect(agIdFor.cell('100', 'row')).toContainText('101');
        await expect(agIdFor.cell('100', 'name')).toContainText('Item 101');
        await expect(agIdFor.cell('100', 'name')).toBeInViewport();
        await expect(agIdFor.cell('0', 'name')).toHaveCount(0);
    });

    test.eachFramework(
        'waits for vertical scrollbar input to pause when debounce is enabled by default',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await expect(page.getByRole('checkbox', { name: 'Debounce vertical scroll' })).toBeChecked();
            await expect(agIdFor.cell('0', 'name')).toContainText('Item 1');
            await pauseClock(page, 6000);

            // Each native scroll event restarts the 100 ms debounce.
            for (const top of [2000, 4000, 6000]) {
                await scrollVerticalScrollbar(page, top);
                await page.clock.runFor(50);
                expect(await scrollPositions(page)).toEqual({ scrollbar: top, viewport: 0 });
                await expect(agIdFor.cell('0', 'name')).toBeInViewport();
                await expect(agIdFor.cell('150', 'name')).toHaveCount(0);
            }

            await page.clock.runFor(49);
            expect(await scrollPositions(page)).toEqual({ scrollbar: 6000, viewport: 0 });
            await page.clock.runFor(1);
            expect(await scrollPositions(page)).toEqual({ scrollbar: 6000, viewport: 6000 });
            await page.clock.resume();

            await expect(agIdFor.cell('150', 'row')).toContainText('151');
            await expect(agIdFor.cell('150', 'name')).toContainText('Item 151');
            await expect(agIdFor.cell('150', 'name')).toBeInViewport();
            await expect(agIdFor.cell('0', 'name')).toHaveCount(0);
        }
    );
});
