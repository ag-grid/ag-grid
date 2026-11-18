import type { Page } from '@playwright/test';
import type { AgGridFixtures } from '@utils/grid/test-utils';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

type AgIdFor = AgGridFixtures['agIdFor'];

const CITY_FILTER = { source: 'filter-toolpanel', colLabel: 'City' } as const;

test.agExample(import.meta, () => {
    const checkbox = (agIdFor: AgIdFor, label: string) => agIdFor.setFilterInstanceItem(CITY_FILTER, label);
    const listItem = (page: Page, agIdFor: AgIdFor, label: string) =>
        page.locator('.ag-set-filter-item').filter({ has: checkbox(agIdFor, label) });
    const listViewport = (page: Page) => page.locator('.ag-filter-toolpanel .ag-virtual-list-viewport');
    const lastListItem = (page: Page) => page.locator('.ag-filter-toolpanel .ag-virtual-list-item').last();
    const scrollList = (page: Page, to: 'top' | 'end') =>
        listViewport(page).evaluate((el: HTMLElement, end) => (el.scrollTop = end ? el.scrollHeight : 0), to === 'end');
    const expandGroup = async (page: Page, agIdFor: AgIdFor, label: string) => {
        const group = listItem(page, agIdFor, label);
        await expect(group).toBeVisible();
        const closedIcon = group.locator('.ag-set-filter-group-closed-icon:not(.ag-hidden)');
        if (await closedIcon.isVisible()) {
            await closedIcon.click();
        }
    };
    const click = (page: Page, name: string) => page.getByRole('button', { name }).click();
    const rows = (page: Page) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

    test.eachFramework(
        'the Filters Tool Panel opens the City filter, and its list scrolls',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await expect(agIdFor.filterToolPanelGroup('City')).toBeVisible();
            await expect(checkbox(agIdFor, 'France')).toBeVisible();
            await expect
                .poll(() => listViewport(page).evaluate((el: HTMLElement) => el.scrollHeight - el.clientHeight))
                .toBeGreaterThan(0);
        }
    );

    test.eachFramework(
        'a value never in the data is listed by its key at the end of the list',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await click(page, 'Select Paris and Madrid');
            await scrollList(page, 'end');

            await expect(lastListItem(page)).toHaveText('Spain#Madrid');
            await expect(listItem(page, agIdFor, 'Spain#Madrid')).toHaveClass(/ag-set-filter-item-missing/);
            await expect(checkbox(agIdFor, 'Spain#Madrid')).toBeChecked();
        }
    );

    test.eachFramework('a removed value stays in its group, marked and unselected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');
        await expandGroup(page, agIdFor, 'Italy');

        await expect(listItem(page, agIdFor, 'Rome')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(listItem(page, agIdFor, 'Rome')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(checkbox(agIdFor, 'Rome')).not.toBeChecked();
        await expect(listItem(page, agIdFor, 'Italy')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('a group is marked once every value under it is gone', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');
        await click(page, 'Remove France');

        await expect(listItem(page, agIdFor, 'France')).toHaveClass(/ag-set-filter-item-missing/);
        await expandGroup(page, agIdFor, 'France');
        await expect(listItem(page, agIdFor, 'Paris')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(checkbox(agIdFor, 'Paris')).toBeChecked();
    });

    test.eachFramework(
        'clearing preserved values discards them and drops them from the model',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await click(page, 'Select Paris and Madrid');
            await click(page, 'Remove Rome');
            await click(page, 'Remove France');
            await click(page, 'Clear Preserved Values');

            await expect(rows(page)).toHaveCount(0);
            await expect(checkbox(agIdFor, 'France')).toHaveCount(0);
            await expandGroup(page, agIdFor, 'Italy');
            await expect(checkbox(agIdFor, 'Milan')).toBeVisible();
            await expect(checkbox(agIdFor, 'Rome')).toHaveCount(0);
            await scrollList(page, 'end');
            await expect(lastListItem(page)).toHaveText('United States');

            await scrollList(page, 'top');
            await click(page, 'Restore Data');
            await expect(checkbox(agIdFor, 'France')).toBeVisible();
            await expect(rows(page)).toHaveCount(0);
        }
    );

    test.eachFramework('restoring data without clearing shows the selected value again', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');
        await click(page, 'Remove France');
        await expect(rows(page)).toHaveCount(0);
        await click(page, 'Restore Data');

        await expect(rows(page).filter({ hasText: 'Paris' })).toBeVisible();
        await expect(rows(page).filter({ hasText: 'Rome' })).toHaveCount(0);
    });
});
