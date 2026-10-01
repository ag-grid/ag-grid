import { expect, orderedValues, test } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

// Fillers are keyed by path; leaves have no getRowId, so they fall back to their `rowData` index.
const DESKTOP = 'row-group-0-Desktop';
const DOCUMENTS = 'row-group-0-Documents';
const WORK = 'row-group-0-Documents-1-Work';
const PROJECT_BETA = 'row-group-0-Documents-1-Work-2-ProjectBeta';
const DESKTOP_PROJECT_ALPHA = 'row-group-0-Desktop-1-ProjectAlpha';
const REPORT_PDF = '7';
const BUDGET_XLSX = '8';
const DESKTOP_PROPOSAL_DOCX = '0';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // isGroupOpenByDefault opens: Documents (level 0), Work (level 1), ProjectBeta (level 2)
        await expect(agIdFor.autoGroupExpanded(DOCUMENTS)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(WORK)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(PROJECT_BETA)).toBeVisible();

        // ProjectBeta children should be visible
        await expect(agIdFor.autoGroupCell(REPORT_PDF)).toContainText('Report.pdf', { useInnerText: true });
        await expect(agIdFor.autoGroupCell(BUDGET_XLSX)).toContainText('Budget.xlsx', { useInnerText: true });

        // Desktop should be collapsed (not opened by default), children not visible
        await expect(agIdFor.autoGroupContracted(DESKTOP)).toBeVisible();
        await expect(agIdFor.autoGroupCell(DESKTOP_PROJECT_ALPHA)).toHaveCount(0);
        await expect(agIdFor.autoGroupCell(DESKTOP_PROPOSAL_DOCX)).toHaveCount(0);
    });

    // The date and number filters each need their own module registered; without it the popup throws on
    // open instead of appearing. The columns name their filters, so every framework gets the same one.
    test.eachFramework('date filters open and filter the tree', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('modified').click();
        await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
        await page.keyboard.press('Escape');

        await agIdFor.headerFilterButton('created').click();
        const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(createdFilter).toBeVisible();

        // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
        await createdFilter.fill('2023-06-22');
        await createdFilter.dispatchEvent('input');
        await page.keyboard.press('Escape');

        // Desktop holds no match, so its disappearance marks the filter as applied.
        await expect(agIdFor.autoGroupCell(DESKTOP)).toHaveCount(0);

        await expect(agIdFor.autoGroupExpanded(PROJECT_BETA)).toBeVisible();

        // Tree data keeps a matching leaf's whole ancestor path, though no group has a `created` of its own.
        // ProjectBeta's other child, Budget.xlsx, is a sibling of the match and so is dropped.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Documents', 'Work', 'ProjectBeta', 'Report.pdf']);
        }).toPass();
    });

    test.eachFramework('the number filter on size filters the tree', async ({ agIdFor, page }) => {
        await agIdFor.headerFilterButton('size').click();
        const sizeFilter = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(sizeFilter).toBeVisible();

        // MeetingNotes_August.pdf is the only row this size, and no group's `sum` aggregation matches it.
        await sizeFilter.fill('460800');
        await sizeFilter.dispatchEvent('input');
        await page.keyboard.press('Escape');

        await expect(agIdFor.autoGroupCell(DOCUMENTS)).toHaveCount(0);
        await agIdFor.autoGroupContracted(DESKTOP).click();

        // Desktop's other children, ToDoList.txt among them, are dropped on size.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Desktop', 'MeetingNotes_August.pdf']);
        }).toPass();
    });
});
