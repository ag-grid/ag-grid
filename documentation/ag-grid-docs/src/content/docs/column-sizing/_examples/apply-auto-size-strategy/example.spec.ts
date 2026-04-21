import { type AgGridFixtures, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number | undefined> {
    return (await locator.boundingBox())?.width;
}

const COL_IDS = ['athlete', 'age', 'country', 'year', 'date', 'sport'] as const;

type ColIds = (typeof COL_IDS)[number];

function getHeaders(agIdFor: AgGridFixtures['agIdFor']): Record<ColIds, Locator> {
    return Object.fromEntries(COL_IDS.map((colId) => [colId, agIdFor.headerCell(colId)])) as Record<ColIds, Locator>;
}

async function totalHeaderWidth(headers: Record<ColIds, Locator>): Promise<number> {
    const widths = await Promise.all(Object.values(headers).map(getWidth));
    return widths.reduce<number>((acc, w) => acc + (w ?? 0), 0);
}

// wait twice as long as animation so we know widths have settled
async function waitForAnimation(page: Page): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(page.locator('.ag-animate-autosize')).not.toBeVisible();
}

test.agExample(import.meta, () => {
    test.eachFramework('override: fitProvidedWidth sizes columns to total width', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const headers = getHeaders(agIdFor);

        await page.getByRole('button', { name: /fitProvidedWidth/ }).click();
        await waitForAnimation(page);

        // All columns must sum to 600 (allowing 1px tolerance for sub-pixel rounding).
        const total = await totalHeaderWidth(headers);
        expect(total).toBeGreaterThanOrEqual(599);
        expect(total).toBeLessThanOrEqual(601);
    });

    test.eachFramework('override: fitGridWidth fills the viewport', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const headers = getHeaders(agIdFor);

        // First shrink with fitProvidedWidth so we can verify fitGridWidth grows.
        await page.getByRole('button', { name: /fitProvidedWidth/ }).click();
        await waitForAnimation(page);
        const shrunkTotal = await totalHeaderWidth(headers);

        await page.getByRole('button', { name: /fitGridWidth/ }).click();
        await waitForAnimation(page);

        const grownTotal = await totalHeaderWidth(headers);
        expect(grownTotal).toBeGreaterThan(shrunkTotal);
    });

    test.eachFramework('re-apply configured strategy is idempotent', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const headers = getHeaders(agIdFor);
        const beforeTotal = await totalHeaderWidth(headers);

        await page.getByRole('button', { name: /Re-apply Configured Strategy/ }).click();
        await waitForAnimation(page);

        const afterTotal = await totalHeaderWidth(headers);
        expect(Math.abs(afterTotal - beforeTotal)).toBeLessThanOrEqual(2);
    });
});
