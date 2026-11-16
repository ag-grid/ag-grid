import type { Page } from '@playwright/test';
import type { AgGridFixtures } from '@utils/grid/test-utils';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

type AgIdFor = AgGridFixtures['agIdFor'];

const FILE_FILTER = { source: 'filter-toolpanel', colLabel: 'File' } as const;

test.agExample(import.meta, () => {
    const checkbox = (agIdFor: AgIdFor, label: string) => agIdFor.setFilterInstanceItem(FILE_FILTER, label);
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
        'the Filters Tool Panel opens the File filter, and its list scrolls',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await expect(agIdFor.filterToolPanelGroup('File')).toBeVisible();
            await expect(checkbox(agIdFor, 'Documents')).toBeVisible();
            await expect
                .poll(() => listViewport(page).evaluate((el: HTMLElement) => el.scrollHeight - el.clientHeight))
                .toBeGreaterThan(0);
        }
    );

    test.eachFramework(
        'a file never in the data is listed by its key at the end of the list',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await click(page, 'Select report.pdf and old.zip');
            await scrollList(page, 'end');

            await expect(lastListItem(page)).toHaveText('Archive/old.zip');
            await expect(listItem(page, agIdFor, 'Archive/old.zip')).toHaveClass(/ag-set-filter-item-missing/);
            await expect(checkbox(agIdFor, 'Archive/old.zip')).toBeChecked();
        }
    );

    test.eachFramework('a removed file stays in its folder, marked and unselected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');
        await expandGroup(page, agIdFor, 'Pictures');

        await expect(listItem(page, agIdFor, 'beach.jpg')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(listItem(page, agIdFor, 'beach.jpg')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(checkbox(agIdFor, 'beach.jpg')).not.toBeChecked();
        await expect(listItem(page, agIdFor, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('a folder is marked once every file under it is gone', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');
        await click(page, 'Remove Documents');

        await expect(listItem(page, agIdFor, 'Documents')).toHaveClass(/ag-set-filter-item-missing/);
        await expandGroup(page, agIdFor, 'Documents');
        await expect(listItem(page, agIdFor, 'report.pdf')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(checkbox(agIdFor, 'report.pdf')).toBeChecked();
    });

    test.eachFramework(
        'clearing preserved values discards them and drops them from the model',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await click(page, 'Select report.pdf and old.zip');
            await click(page, 'Remove beach.jpg');
            await click(page, 'Remove Documents');
            await click(page, 'Clear Preserved Values');

            await expect(rows(page)).toHaveCount(0);
            await expect(checkbox(agIdFor, 'Documents')).toHaveCount(0);
            await expandGroup(page, agIdFor, 'Pictures');
            await expect(checkbox(agIdFor, 'city.jpg')).toBeVisible();
            await expect(checkbox(agIdFor, 'beach.jpg')).toHaveCount(0);
            await scrollList(page, 'end');
            await expect(lastListItem(page)).toHaveText('Videos');

            await scrollList(page, 'top');
            await click(page, 'Restore Data');
            await expect(checkbox(agIdFor, 'Documents')).toBeVisible();
            await expect(rows(page)).toHaveCount(0);
        }
    );

    test.eachFramework('restoring data without clearing shows the selected file again', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');
        await click(page, 'Remove Documents');
        await expect(rows(page)).toHaveCount(0);
        await click(page, 'Restore Data');

        await expect(rows(page).filter({ hasText: 'report.pdf' })).toBeVisible();
        await expect(rows(page).filter({ hasText: 'beach.jpg' })).toHaveCount(0);
    });
});
