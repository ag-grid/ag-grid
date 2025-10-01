import type { Page } from '@playwright/test';

import { test } from '../test-utils';

export async function repeat(
    page: Page,
    title: string,
    fn: () => Promise<void>,
    { count, eachWait, afterAllWait }: { count: number; eachWait?: number; afterAllWait?: number } = { count: 1 }
) {
    await test.step(title, async () => {
        if (count < 2) {
            await fn();
            if (eachWait !== undefined) {
                await page.waitForTimeout(eachWait);
                return;
            }
            if (afterAllWait !== undefined) {
                await page.waitForTimeout(afterAllWait);
            }
        }

        for (let i = 0; i < count; i++) {
            await fn();
            if (eachWait !== undefined) {
                await page.waitForTimeout(eachWait);
            }
        }
        if (afterAllWait !== undefined) {
            await page.waitForTimeout(afterAllWait);
        }
    });
}
