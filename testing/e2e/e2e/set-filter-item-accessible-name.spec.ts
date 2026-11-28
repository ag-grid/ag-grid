import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GridApi } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

/** Option names as Chrome exposes them to screen readers; testing-library and Playwright compute their own. */
async function axOptionNames(page: Page): Promise<string[]> {
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    await cdp.detach();
    return nodes
        .filter((node) => !node.ignored && node.role?.value === 'option')
        .map((node) => String(node.name?.value ?? ''));
}

test.describe('Set Filter item accessible name', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'reads the Chrome accessibility tree over CDP');

    for (const { name, open, rendered, names } of [
        {
            name: 'plain',
            open: (api: GridApi) => api.showColumnFilter('athlete'),
            rendered: 'Aleksey Nemov',
            names: ['(Select All)', 'Aleksey Nemov', 'Ian Thorpe'],
        },
        {
            name: 'cell renderer',
            open: (api: GridApi) => api.showColumnFilter('country'),
            rendered: 'Russia',
            names: ['(Select All)', 'Australia', 'Russia'],
        },
    ]) {
        test(`${name} items are each named by their text once`, async ({ page }) => {
            const { withApi } = await mountGrid(page, {
                enterprise: true,
                options: () => ({
                    columnDefs: [
                        { field: 'athlete', filter: 'agSetColumnFilter' },
                        {
                            field: 'country',
                            filter: 'agSetColumnFilter',
                            filterParams: { cellRenderer: (params: { value: string }) => `<b>${params.value}</b>` },
                        },
                    ],
                    rowData: [
                        { athlete: 'Aleksey Nemov', country: 'Russia' },
                        { athlete: 'Ian Thorpe', country: 'Australia' },
                    ],
                }),
            });

            await withApi(open);
            await expect(page.locator('.ag-set-filter-item', { hasText: rendered })).toBeVisible();
            expect(await axOptionNames(page)).toEqual(names);
        });
    }
});
